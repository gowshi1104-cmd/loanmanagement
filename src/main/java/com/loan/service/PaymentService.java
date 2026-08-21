package com.loan.service;

import com.loan.dto.PaymentResponse;
import com.loan.entity.Loan;
import com.loan.entity.Member;
import com.loan.entity.Payment;
import com.loan.repository.LoanRepository;
import com.loan.repository.MemberRepository;
import com.loan.repository.PaymentRepository;

import org.json.JSONArray;
import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final MemberRepository memberRepository;
    private final LoanRepository loanRepository;

    private final HttpClient httpClient =
            HttpClient.newHttpClient();

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public PaymentService(
            PaymentRepository paymentRepository,
            MemberRepository memberRepository,
            LoanRepository loanRepository) {

        this.paymentRepository = paymentRepository;
        this.memberRepository = memberRepository;
        this.loanRepository = loanRepository;
    }

    // =========================================================
    // CASHFREE CONFIG
    // =========================================================

    @Value("${cashfree.app.id}")
    private String cashfreeAppId;

    @Value("${cashfree.secret.key}")
    private String cashfreeSecretKey;

    @Value("${cashfree.base.url}")
    private String cashfreeBaseUrl;

    @Value("${cashfree.api.version}")
    private String cashfreeApiVersion;

    @Value("${frontend.url}")
    private String frontendUrl;

    // =========================================================
    // GET ALL PAYMENTS
    // =========================================================

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================

    public Payment getPaymentById(Long id) {

        return paymentRepository
                .findById(id)
                .orElse(null);
    }

    // =========================================================
    // GET PAYMENTS BY LOAN ID
    // =========================================================

    public List<Payment> getPaymentsByLoanId(String loanId) {

        if (loanId == null ||
                loanId.trim().isEmpty()) {

            throw new RuntimeException(
                    "Loan ID is required"
            );
        }

        String normalizedLoanId =
                loanId.trim().toUpperCase();

        return paymentRepository
                .findByLoanIdOrderByPaymentDateDesc(
                        normalizedLoanId
                );
    }

    // =========================================================
    // GET MEMBER PAYMENT DETAILS
    // =========================================================

    public Map<String, Object> getMemberPaymentDetails(
            String loanId) {

        if (loanId == null ||
                loanId.trim().isEmpty()) {

            throw new RuntimeException(
                    "Loan ID is required"
            );
        }

        // -----------------------------------------------------
        // NORMALIZE LOAN ID
        // -----------------------------------------------------

        String normalizedLoanId =
                loanId.trim().toUpperCase();

        // -----------------------------------------------------
        // FIND LOAN
        // -----------------------------------------------------

        Loan loan =
                loanRepository
                        .findByLoanId(normalizedLoanId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Loan not found with ID: "
                                                + normalizedLoanId
                                )
                        );

        // -----------------------------------------------------
        // GET CUSTOMER ID
        // -----------------------------------------------------

        String rawCustomerId =
                loan.getCustomerId();

        if (rawCustomerId == null ||
                rawCustomerId.trim().isEmpty()) {

            throw new RuntimeException(
                    "Customer ID is not available for loan: "
                            + normalizedLoanId
            );
        }

        // IMPORTANT:
        // Do NOT reassign customerId.
        // Keep normalized value in a separate variable.
        final String normalizedCustomerId =
                rawCustomerId.trim().toUpperCase();

        // -----------------------------------------------------
        // FIND MEMBER
        // -----------------------------------------------------

        Member member =
                memberRepository
                        .findByCustomerId(
                                normalizedCustomerId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Member not found with customer ID: "
                                                + normalizedCustomerId
                                )
                        );

        // -----------------------------------------------------
        // EMI
        // -----------------------------------------------------

        Double emiAmount =
                loan.getEmiAmount();

        if (emiAmount == null ||
                emiAmount <= 0) {

            throw new RuntimeException(
                    "EMI amount is not available for loan: "
                            + normalizedLoanId
            );
        }

        // -----------------------------------------------------
        // PAYMENTS
        // -----------------------------------------------------

        List<Payment> payments =
                paymentRepository
                        .findByLoanId(
                                normalizedLoanId
                        );

        // -----------------------------------------------------
        // TOTAL SUCCESSFUL PAYMENTS
        // -----------------------------------------------------

        double totalSuccessfulPayments = 0.0;

        if (payments != null) {

            totalSuccessfulPayments =
                    payments.stream()
                            .filter(payment ->
                                    "SUCCESS".equalsIgnoreCase(
                                            payment.getStatus()
                                    )
                            )
                            .filter(payment ->
                                    payment.getAmount() != null
                            )
                            .mapToDouble(
                                    Payment::getAmount
                            )
                            .sum();
        }

        // -----------------------------------------------------
        // LOAN AMOUNT
        // -----------------------------------------------------

        double loanAmount =
                loan.getLoanAmount() != null
                        ? loan.getLoanAmount()
                        : 0.0;

        // -----------------------------------------------------
        // DUE AMOUNT
        // -----------------------------------------------------

        double dueAmount =
                loanAmount -
                        totalSuccessfulPayments;

        if (dueAmount < 0) {
            dueAmount = 0.0;
        }

        // -----------------------------------------------------
        // OVERDUE
        // -----------------------------------------------------

        double overdueAmount = 0.0;

        if ("OVERDUE".equalsIgnoreCase(
                loan.getStatus())) {

            overdueAmount = emiAmount;
        }

        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "loanId",
                loan.getLoanId()
        );

        // Payment.memberId = Customer ID
        response.put(
                "memberId",
                normalizedCustomerId
        );

        // API convenience response
        response.put(
                "customerId",
                normalizedCustomerId
        );

        response.put(
                "customerName",
                member.getName()
        );

        response.put(
                "phone",
                member.getPhone()
        );

        response.put(
                "loanAmount",
                loanAmount
        );

        response.put(
                "emiAmount",
                emiAmount
        );

        response.put(
                "dueAmount",
                dueAmount
        );

        response.put(
                "overdueAmount",
                overdueAmount
        );

        response.put(
                "loanStatus",
                loan.getStatus()
        );

        response.put(
                "tenureMonths",
                loan.getTenureMonths()
        );

        response.put(
                "nextEmiDate",
                loan.getNextEmiDate()
        );

        return response;
    }

    // =========================================================
    // CREATE PAYMENT
    // =========================================================

    public Payment createPayment(
            Payment payment) {

        if (payment == null) {

            throw new RuntimeException(
                    "Payment data is required"
            );
        }

        // -----------------------------------------------------
        // LOAN ID REQUIRED
        // -----------------------------------------------------

        if (payment.getLoanId() == null ||
                payment.getLoanId().trim().isEmpty()) {

            throw new RuntimeException(
                    "Loan ID is required"
            );
        }

        // -----------------------------------------------------
        // NORMALIZE LOAN ID
        // -----------------------------------------------------

        String normalizedLoanId =
                payment.getLoanId()
                        .trim()
                        .toUpperCase();

        payment.setLoanId(
                normalizedLoanId
        );

        // -----------------------------------------------------
        // FIND LOAN
        // -----------------------------------------------------

        Loan loan =
                loanRepository
                        .findByLoanId(
                                normalizedLoanId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Loan not found with ID: "
                                                + normalizedLoanId
                                )
                        );

        // -----------------------------------------------------
        // GET CUSTOMER ID FROM LOAN
        // -----------------------------------------------------

        String rawCustomerId =
                loan.getCustomerId();

        if (rawCustomerId == null ||
                rawCustomerId.trim().isEmpty()) {

            throw new RuntimeException(
                    "Customer ID is not available for loan: "
                            + normalizedLoanId
            );
        }

        // IMPORTANT:
        // Separate variable so lambda can safely use it.
        final String normalizedCustomerId =
                rawCustomerId.trim().toUpperCase();

        // -----------------------------------------------------
        // FIND MEMBER
        // -----------------------------------------------------

        Member member =
                memberRepository
                        .findByCustomerId(
                                normalizedCustomerId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Member not found with customer ID: "
                                                + normalizedCustomerId
                                )
                        );

        // -----------------------------------------------------
        // PAYMENT MEMBER ID
        //
        // Payment.memberId = Customer ID
        // -----------------------------------------------------

        payment.setMemberId(
                normalizedCustomerId
        );

        // -----------------------------------------------------
        // CUSTOMER NAME
        // -----------------------------------------------------

        payment.setCustomerName(
                member.getName()
        );

        // -----------------------------------------------------
        // EMI
        // -----------------------------------------------------

        Double emiAmount =
                loan.getEmiAmount();

        if (emiAmount == null ||
                emiAmount <= 0) {

            throw new RuntimeException(
                    "EMI amount is not available for loan: "
                            + normalizedLoanId
            );
        }

        // -----------------------------------------------------
        // PAYMENT AMOUNT
        // -----------------------------------------------------

        if (payment.getAmount() == null ||
                payment.getAmount() <= 0) {

            payment.setAmount(
                    emiAmount
            );
        }

        // -----------------------------------------------------
        // PAYMENT MODE
        // -----------------------------------------------------

        String mode =
                payment.getPaymentMode();

        if (mode == null ||
                mode.trim().isEmpty()) {

            throw new RuntimeException(
                    "Payment mode is required"
            );
        }

        mode = mode.trim();

        // -----------------------------------------------------
        // UPI
        // -----------------------------------------------------

        if ("UPI".equalsIgnoreCase(mode)) {

            payment.setStatus(
                    "PENDING"
            );

            payment.setVerificationStatus(
                    "PENDING"
            );

            payment.setReceiptNumber(
                    null
            );
        }

        // -----------------------------------------------------
        // CASH
        // -----------------------------------------------------

        else if ("CASH".equalsIgnoreCase(mode)) {

            payment.setStatus(
                    "SUCCESS"
            );

            payment.setVerificationStatus(
                    "VERIFIED"
            );

            if (payment.getReceiptNumber() == null ||
                    payment.getReceiptNumber()
                            .trim()
                            .isEmpty()) {

                payment.setReceiptNumber(
                        generateReceiptNumber()
                );
            }
        }

        // -----------------------------------------------------
        // BANK TRANSFER
        // -----------------------------------------------------

        else if ("BANK TRANSFER".equalsIgnoreCase(mode)) {

            payment.setStatus(
                    "SUCCESS"
            );

            payment.setVerificationStatus(
                    "VERIFIED"
            );

            if (payment.getReceiptNumber() == null ||
                    payment.getReceiptNumber()
                            .trim()
                            .isEmpty()) {

                payment.setReceiptNumber(
                        generateReceiptNumber()
                );
            }
        }

        // -----------------------------------------------------
        // INVALID MODE
        // -----------------------------------------------------

        else {

            throw new RuntimeException(
                    "Unsupported payment mode: "
                            + mode
            );
        }

        return paymentRepository.save(
                payment
        );
    }

    // =========================================================
    // UPDATE PAYMENT
    // =========================================================

    public Payment updatePayment(
            Long id,
            Payment updatedPayment) {

        return paymentRepository
                .findById(id)
                .map(payment -> {

                    // -------------------------------------------------
                    // LOAN ID
                    // -------------------------------------------------

                    if (updatedPayment.getLoanId() != null &&
                            !updatedPayment.getLoanId()
                                    .trim()
                                    .isEmpty()) {

                        payment.setLoanId(
                                updatedPayment
                                        .getLoanId()
                                        .trim()
                                        .toUpperCase()
                        );
                    }

                    // -------------------------------------------------
                    // MEMBER ID = CUSTOMER ID
                    // -------------------------------------------------

                    if (updatedPayment.getMemberId() != null &&
                            !updatedPayment.getMemberId()
                                    .trim()
                                    .isEmpty()) {

                        payment.setMemberId(
                                updatedPayment
                                        .getMemberId()
                                        .trim()
                                        .toUpperCase()
                        );
                    }

                    // -------------------------------------------------
                    // CUSTOMER NAME
                    // -------------------------------------------------

                    payment.setCustomerName(
                            updatedPayment
                                    .getCustomerName()
                    );

                    // -------------------------------------------------
                    // PAYMENT DETAILS
                    // -------------------------------------------------

                    payment.setAmount(
                            updatedPayment.getAmount()
                    );

                    payment.setPaymentDate(
                            updatedPayment.getPaymentDate()
                    );

                    payment.setPaymentMode(
                            updatedPayment.getPaymentMode()
                    );

                    payment.setStatus(
                            updatedPayment.getStatus()
                    );

                    // -------------------------------------------------
                    // UPI
                    // -------------------------------------------------

                    payment.setUpiOption(
                            updatedPayment.getUpiOption()
                    );

                    payment.setUpiId(
                            updatedPayment.getUpiId()
                    );

                    // -------------------------------------------------
                    // CASH
                    // -------------------------------------------------

                    payment.setReceivedBy(
                            updatedPayment.getReceivedBy()
                    );

                    // -------------------------------------------------
                    // BANK
                    // -------------------------------------------------

                    payment.setAccountNumber(
                            updatedPayment.getAccountNumber()
                    );

                    payment.setIfscCode(
                            updatedPayment.getIfscCode()
                    );

                    payment.setBankName(
                            updatedPayment.getBankName()
                    );

                    // -------------------------------------------------
                    // TRANSACTION
                    // -------------------------------------------------

                    payment.setTransactionReference(
                            updatedPayment
                                    .getTransactionReference()
                    );

                    payment.setVerificationStatus(
                            updatedPayment
                                    .getVerificationStatus()
                    );

                    // -------------------------------------------------
                    // CASHFREE
                    // -------------------------------------------------

                    payment.setCashfreeOrderId(
                            updatedPayment
                                    .getCashfreeOrderId()
                    );

                    payment.setCashfreePaymentSessionId(
                            updatedPayment
                                    .getCashfreePaymentSessionId()
                    );

                    payment.setCashfreePaymentId(
                            updatedPayment
                                    .getCashfreePaymentId()
                    );

                    // -------------------------------------------------
                    // RECEIPT
                    // -------------------------------------------------

                    payment.setReceiptNumber(
                            updatedPayment
                                    .getReceiptNumber()
                    );

                    return paymentRepository.save(
                            payment
                    );
                })
                .orElse(null);
    }

    // =========================================================
    // CREATE CASHFREE ORDER
    // =========================================================

    public Map<String, Object> createCashfreeOrder(
            Long paymentId) {

        try {

            Payment payment =
                    paymentRepository
                            .findById(paymentId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Payment not found with ID: "
                                                    + paymentId
                                    )
                            );

            // -------------------------------------------------
            // ONLY UPI
            // -------------------------------------------------

            if (!"UPI".equalsIgnoreCase(
                    payment.getPaymentMode())) {

                throw new RuntimeException(
                        "Cashfree payment is available only for UPI payments"
                );
            }

            // -------------------------------------------------
            // AMOUNT
            // -------------------------------------------------

            if (payment.getAmount() == null ||
                    payment.getAmount() <= 0) {

                throw new RuntimeException(
                        "Invalid payment amount"
                );
            }

            // -------------------------------------------------
            // CUSTOMER ID
            //
            // Payment.memberId = Customer ID
            // -------------------------------------------------

            String rawCustomerId =
                    payment.getMemberId();

            if (rawCustomerId == null ||
                    rawCustomerId.trim().isEmpty()) {

                throw new RuntimeException(
                        "Customer ID is required for Cashfree payment"
                );
            }

            // IMPORTANT:
            // final variable for lambda usage
            final String normalizedCustomerId =
                    rawCustomerId.trim().toUpperCase();

            payment.setMemberId(
                    normalizedCustomerId
            );

            // -------------------------------------------------
            // FIND MEMBER
            // -------------------------------------------------

            Member member =
                    memberRepository
                            .findByCustomerId(
                                    normalizedCustomerId
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Member not found with customer ID: "
                                                    + normalizedCustomerId
                                    )
                            );

            // -------------------------------------------------
            // CUSTOMER PHONE
            // -------------------------------------------------

            String customerPhone =
                    member.getPhone();

            if (customerPhone == null ||
                    customerPhone.trim().isEmpty()) {

                throw new RuntimeException(
                        "Customer phone number is required for Cashfree payment"
                );
            }

            customerPhone =
                    customerPhone.replaceAll(
                            "[^0-9]",
                            ""
                    );

            if (customerPhone.length() > 10) {

                customerPhone =
                        customerPhone.substring(
                                customerPhone.length() - 10
                        );
            }

            if (customerPhone.length() != 10) {

                throw new RuntimeException(
                        "Invalid customer phone number"
                );
            }

            // -------------------------------------------------
            // UNIQUE ORDER ID
            // -------------------------------------------------

            String orderId =
                    "loan_"
                            + payment.getId()
                            + "_"
                            + UUID.randomUUID()
                                    .toString()
                                    .replace(
                                            "-",
                                            ""
                                    )
                                    .substring(
                                            0,
                                            12
                                    );

            // -------------------------------------------------
            // REQUEST JSON
            // -------------------------------------------------

            JSONObject requestJson =
                    new JSONObject();

            requestJson.put(
                    "order_id",
                    orderId
            );

            requestJson.put(
                    "order_amount",
                    payment.getAmount()
            );

            requestJson.put(
                    "order_currency",
                    "INR"
            );

            // -------------------------------------------------
            // CUSTOMER DETAILS
            // -------------------------------------------------

            JSONObject customerDetails =
                    new JSONObject();

            customerDetails.put(
                    "customer_id",
                    normalizedCustomerId
            );

            customerDetails.put(
                    "customer_name",
                    payment.getCustomerName() != null &&
                            !payment.getCustomerName()
                                    .trim()
                                    .isEmpty()
                            ? payment.getCustomerName()
                            : member.getName()
            );

            customerDetails.put(
                    "customer_phone",
                    customerPhone
            );

            requestJson.put(
                    "customer_details",
                    customerDetails
            );

            // -------------------------------------------------
            // RETURN URL
            // -------------------------------------------------

            JSONObject orderMeta =
                    new JSONObject();

            orderMeta.put(
                    "return_url",
                    frontendUrl
                            + "/payments/cashfree-return?order_id={order_id}"
            );

            requestJson.put(
                    "order_meta",
                    orderMeta
            );

            // -------------------------------------------------
            // ORDER NOTE
            // -------------------------------------------------

            requestJson.put(
                    "order_note",
                    "Loan payment - "
                            + payment.getLoanId()
            );

            // -------------------------------------------------
            // ORDER TAGS
            // -------------------------------------------------

            JSONObject orderTags =
                    new JSONObject();

            orderTags.put(
                    "payment_id",
                    String.valueOf(
                            payment.getId()
                    )
            );

            orderTags.put(
                    "loan_id",
                    payment.getLoanId()
            );

            orderTags.put(
                    "member_id",
                    normalizedCustomerId
            );

            requestJson.put(
                    "order_tags",
                    orderTags
            );

            // -------------------------------------------------
            // CASHFREE URL
            // -------------------------------------------------

            String url =
                    cashfreeBaseUrl
                            + "/orders";

            // -------------------------------------------------
            // REQUEST
            // -------------------------------------------------

            HttpRequest request =
                    HttpRequest
                            .newBuilder()
                            .uri(
                                    URI.create(url)
                            )
                            .header(
                                    "Content-Type",
                                    "application/json"
                            )
                            .header(
                                    "Accept",
                                    "application/json"
                            )
                            .header(
                                    "x-api-version",
                                    cashfreeApiVersion
                            )
                            .header(
                                    "x-client-id",
                                    cashfreeAppId
                            )
                            .header(
                                    "x-client-secret",
                                    cashfreeSecretKey
                            )
                            .header(
                                    "x-idempotency-key",
                                    UUID.randomUUID()
                                            .toString()
                            )
                            .POST(
                                    HttpRequest
                                            .BodyPublishers
                                            .ofString(
                                                    requestJson
                                                            .toString()
                                            )
                            )
                            .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers
                                    .ofString()
                    );

            int statusCode =
                    response.statusCode();

            String responseBody =
                    response.body();

            System.out.println(
                    "CASHFREE CREATE ORDER STATUS: "
                            + statusCode
            );

            System.out.println(
                    "CASHFREE CREATE ORDER RESPONSE: "
                            + responseBody
            );

            if (statusCode < 200 ||
                    statusCode >= 300) {

                throw new RuntimeException(
                        "Cashfree Create Order failed. HTTP "
                                + statusCode
                                + ": "
                                + responseBody
                );
            }

            JSONObject cashfreeResponse =
                    new JSONObject(
                            responseBody
                    );

            String returnedOrderId =
                    cashfreeResponse.optString(
                            "order_id",
                            null
                    );

            String paymentSessionId =
                    cashfreeResponse.optString(
                            "payment_session_id",
                            null
                    );

            String cfOrderId =
                    cashfreeResponse.optString(
                            "cf_order_id",
                            null
                    );

            String orderStatus =
                    cashfreeResponse.optString(
                            "order_status",
                            null
                    );

            if (returnedOrderId == null ||
                    returnedOrderId.trim().isEmpty()) {

                throw new RuntimeException(
                        "Cashfree order_id was not returned"
                );
            }

            if (paymentSessionId == null ||
                    paymentSessionId.trim().isEmpty()) {

                throw new RuntimeException(
                        "Cashfree payment_session_id was not returned"
                );
            }

            payment.setCashfreeOrderId(
                    returnedOrderId
            );

            payment.setCashfreePaymentSessionId(
                    paymentSessionId
            );

            payment.setCashfreePaymentId(
                    null
            );

            payment.setTransactionReference(
                    returnedOrderId
            );

            payment.setStatus(
                    "PENDING"
            );

            payment.setVerificationStatus(
                    "PENDING"
            );

            payment.setReceiptNumber(
                    null
            );

            paymentRepository.save(
                    payment
            );

            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            Map<String, Object> result =
                    new HashMap<>();

            result.put(
                    "paymentId",
                    payment.getId()
            );

            result.put(
                    "loanId",
                    payment.getLoanId()
            );

            result.put(
                    "memberId",
                    normalizedCustomerId
            );

            result.put(
                    "customerId",
                    normalizedCustomerId
            );

            result.put(
                    "orderId",
                    returnedOrderId
            );

            result.put(
                    "cfOrderId",
                    cfOrderId
            );

            result.put(
                    "paymentSessionId",
                    paymentSessionId
            );

            result.put(
                    "amount",
                    payment.getAmount()
            );

            result.put(
                    "currency",
                    "INR"
            );

            result.put(
                    "orderStatus",
                    orderStatus
            );

            result.put(
                    "gateway",
                    "CASHFREE"
            );

            return result;

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Failed to create Cashfree order: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // CHECK CASHFREE PAYMENT STATUS
    // =========================================================

    public PaymentResponse checkCashfreePaymentStatus(
            Long paymentId) {

        try {

            Payment payment =
                    paymentRepository
                            .findById(paymentId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Payment not found with ID: "
                                                    + paymentId
                                    )
                            );

            // -------------------------------------------------
            // ALREADY SUCCESS
            // -------------------------------------------------

            if ("SUCCESS".equalsIgnoreCase(
                    payment.getStatus())) {

                return buildPaymentResponse(
                        payment
                );
            }

            // -------------------------------------------------
            // ORDER ID
            // -------------------------------------------------

            String orderId =
                    payment.getCashfreeOrderId();

            if (orderId == null ||
                    orderId.trim().isEmpty()) {

                orderId =
                        payment.getTransactionReference();
            }

            if (orderId == null ||
                    orderId.trim().isEmpty()) {

                throw new RuntimeException(
                        "Cashfree order ID not found for payment"
                );
            }

            // -------------------------------------------------
            // CASHFREE PAYMENT API
            // -------------------------------------------------

            String url =
                    cashfreeBaseUrl
                            + "/orders/"
                            + orderId
                            + "/payments";

            HttpRequest request =
                    HttpRequest
                            .newBuilder()
                            .uri(
                                    URI.create(url)
                            )
                            .header(
                                    "Accept",
                                    "application/json"
                            )
                            .header(
                                    "x-api-version",
                                    cashfreeApiVersion
                            )
                            .header(
                                    "x-client-id",
                                    cashfreeAppId
                            )
                            .header(
                                    "x-client-secret",
                                    cashfreeSecretKey
                            )
                            .GET()
                            .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers
                                    .ofString()
                    );

            int statusCode =
                    response.statusCode();

            String responseBody =
                    response.body();

            System.out.println(
                    "CASHFREE STATUS CODE: "
                            + statusCode
            );

            System.out.println(
                    "CASHFREE STATUS RESPONSE: "
                            + responseBody
            );

            if (statusCode < 200 ||
                    statusCode >= 300) {

                throw new RuntimeException(
                        "Cashfree status API failed. HTTP "
                                + statusCode
                                + ": "
                                + responseBody
                );
            }

            JSONArray payments =
                    new JSONArray(
                            responseBody
                    );

            // -------------------------------------------------
            // NO PAYMENT
            // -------------------------------------------------

            if (payments.length() == 0) {

                payment.setStatus(
                        "PENDING"
                );

                payment.setVerificationStatus(
                        "PENDING"
                );

                paymentRepository.save(
                        payment
                );

                return buildPaymentResponse(
                        payment
                );
            }

            JSONObject successfulPayment =
                    null;

            JSONObject latestPayment =
                    null;

            // -------------------------------------------------
            // FIND PAYMENT STATUS
            // -------------------------------------------------

            for (int i = 0;
                 i < payments.length();
                 i++) {

                JSONObject currentPayment =
                        payments.getJSONObject(i);

                latestPayment =
                        currentPayment;

                String paymentStatus =
                        currentPayment.optString(
                                "payment_status"
                        );

                if ("SUCCESS".equalsIgnoreCase(
                        paymentStatus)) {

                    successfulPayment =
                            currentPayment;

                    break;
                }
            }

            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            if (successfulPayment != null) {

                double receivedAmount =
                        successfulPayment.optDouble(
                                "payment_amount",
                                -1
                        );

                double expectedAmount =
                        payment.getAmount();

                // -------------------------------------------------
                // AMOUNT VALIDATION
                // -------------------------------------------------

                if (receivedAmount < 0 ||
                        Math.abs(
                                receivedAmount -
                                        expectedAmount
                        ) > 0.01) {

                    payment.setStatus(
                            "FAILED"
                    );

                    payment.setVerificationStatus(
                            "FAILED"
                    );

                    paymentRepository.save(
                            payment
                    );

                    throw new RuntimeException(
                            "Cashfree payment amount mismatch. Expected: "
                                    + expectedAmount
                                    + ", received: "
                                    + receivedAmount
                    );
                }

                // -------------------------------------------------
                // CASHFREE PAYMENT ID
                // -------------------------------------------------

                String cfPaymentId =
                        successfulPayment.optString(
                                "cf_payment_id",
                                null
                        );

                payment.setCashfreePaymentId(
                        cfPaymentId
                );

                // -------------------------------------------------
                // BANK REFERENCE
                // -------------------------------------------------

                String bankReference =
                        successfulPayment.optString(
                                "bank_reference",
                                null
                        );

                if (bankReference != null &&
                        !bankReference.trim().isEmpty()) {

                    payment.setTransactionReference(
                            bankReference
                    );

                } else if (cfPaymentId != null &&
                        !cfPaymentId.trim().isEmpty()) {

                    payment.setTransactionReference(
                            cfPaymentId
                    );
                }

                // -------------------------------------------------
                // SUCCESS
                // -------------------------------------------------

                payment.setStatus(
                        "SUCCESS"
                );

                payment.setVerificationStatus(
                        "VERIFIED"
                );

                // -------------------------------------------------
                // RECEIPT
                // -------------------------------------------------

                if (payment.getReceiptNumber() == null ||
                        payment.getReceiptNumber()
                                .trim()
                                .isEmpty()) {

                    payment.setReceiptNumber(
                            generateReceiptNumber()
                    );
                }

                paymentRepository.save(
                        payment
                );

                return buildPaymentResponse(
                        payment
                );
            }

            // -------------------------------------------------
            // LATEST STATUS
            // -------------------------------------------------

            if (latestPayment != null) {

                String latestStatus =
                        latestPayment.optString(
                                "payment_status"
                        );

                if ("FAILED".equalsIgnoreCase(
                        latestStatus)) {

                    payment.setStatus(
                            "FAILED"
                    );

                    payment.setVerificationStatus(
                            "FAILED"
                    );

                } else {

                    payment.setStatus(
                            "PENDING"
                    );

                    payment.setVerificationStatus(
                            "PENDING"
                    );
                }

                paymentRepository.save(
                        payment
                );
            }

            return buildPaymentResponse(
                    payment
            );

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Failed to check Cashfree payment status: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // BUILD PAYMENT RESPONSE
    // =========================================================

    private PaymentResponse buildPaymentResponse(
            Payment payment) {

        PaymentResponse response =
                new PaymentResponse();

        response.setId(
                payment.getId()
        );

        // Payment.memberId = Customer ID
        response.setMemberId(
                payment.getMemberId()
        );

        response.setCustomerName(
                payment.getCustomerName()
        );

        response.setAmount(
                payment.getAmount()
        );

        response.setPaymentDate(
                payment.getPaymentDate()
        );

        response.setPaymentMode(
                payment.getPaymentMode()
        );

        response.setStatus(
                payment.getStatus()
        );

        response.setTransactionReference(
                payment.getTransactionReference()
        );

        response.setReceiptNumber(
                payment.getReceiptNumber()
        );

        return response;
    }

    // =========================================================
    // DELETE PAYMENT
    // =========================================================

    public void deletePayment(Long id) {

        paymentRepository.deleteById(
                id
        );
    }

    // =========================================================
    // GENERATE RECEIPT
    // =========================================================

    private String generateReceiptNumber() {

        String randomPart =
                UUID.randomUUID()
                        .toString()
                        .substring(
                                0,
                                8
                        )
                        .toUpperCase();

        return "REC-" + randomPart;
    }
}