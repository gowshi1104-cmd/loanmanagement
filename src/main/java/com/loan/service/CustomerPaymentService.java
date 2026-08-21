package com.loan.service;

import com.loan.dto.CustomerPaymentRequest;
import com.loan.dto.CustomerPaymentResponse;
import com.loan.entity.CustomerPayment;
import com.loan.entity.Loan;
import com.loan.entity.Member;
import com.loan.repository.CustomerPaymentRepository;
import com.loan.repository.LoanRepository;
import com.loan.repository.MemberRepository;

import org.json.JSONArray;
import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class CustomerPaymentService {

    private final CustomerPaymentRepository
            customerPaymentRepository;

    private final LoanRepository
            loanRepository;

    private final MemberRepository
            memberRepository;

    private final HttpClient httpClient =
            HttpClient.newHttpClient();

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public CustomerPaymentService(
            CustomerPaymentRepository customerPaymentRepository,
            LoanRepository loanRepository,
            MemberRepository memberRepository) {

        this.customerPaymentRepository =
                customerPaymentRepository;

        this.loanRepository =
                loanRepository;

        this.memberRepository =
                memberRepository;
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
    // GET CUSTOMER DETAILS
    // =========================================================

    public List<CustomerPaymentResponse>
    getMyLoanDetails(
            String authenticatedCustomerId) {

        String customerId =
                normalizeCustomerId(
                        authenticatedCustomerId
                );

        List<Loan> allLoans =
                loanRepository.findAll();

        List<CustomerPaymentResponse> result =
                new ArrayList<>();

        for (Loan loan : allLoans) {

            if (loan.getCustomerId() == null) {
                continue;
            }

            String loanCustomerId =
                    normalizeCustomerId(
                            loan.getCustomerId()
                    );

            if (!customerId.equals(
                    loanCustomerId)) {

                continue;
            }

            CustomerPaymentResponse response =
                    new CustomerPaymentResponse();

            response.setCustomerId(
                    customerId
            );

            response.setLoanId(
                    loan.getLoanId()
            );

            response.setAmount(
                    loan.getEmiAmount()
            );

            response.setStatus(
                    loan.getStatus()
            );

            result.add(response);
        }

        return result;
    }

    // =========================================================
    // CREATE CUSTOMER PAYMENT
    // =========================================================

    public CustomerPaymentResponse
    createCustomerPayment(
            String authenticatedCustomerId,
            CustomerPaymentRequest request) {

        if (request == null ||
                request.getLoanId() == null ||
                request.getLoanId()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Loan ID is required"
            );
        }

        // -----------------------------------------------------
        // AUTHENTICATED CUSTOMER
        // -----------------------------------------------------

        String customerId =
                normalizeCustomerId(
                        authenticatedCustomerId
                );

        // -----------------------------------------------------
        // FIND CUSTOMER
        // -----------------------------------------------------

        Member member =
                memberRepository
                        .findByCustomerId(
                                customerId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        // -----------------------------------------------------
        // LOAN ID
        // -----------------------------------------------------

        String loanId =
                request.getLoanId()
                        .trim()
                        .toUpperCase();

        // -----------------------------------------------------
        // FIND LOAN
        // -----------------------------------------------------

        Loan loan =
                loanRepository
                        .findByLoanId(
                                loanId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Loan not found: "
                                                + loanId
                                )
                        );

        // -----------------------------------------------------
        // IMPORTANT SECURITY CHECK
        //
        // Customer can pay ONLY their own loan.
        // -----------------------------------------------------

        String loanCustomerId =
                normalizeCustomerId(
                        loan.getCustomerId()
                );

        if (!customerId.equals(
                loanCustomerId)) {

            throw new RuntimeException(
                    "You are not authorized to pay this loan"
            );
        }

        // -----------------------------------------------------
        // ONLY APPROVED / ACTIVE LOANS
        // -----------------------------------------------------

        String loanStatus =
                loan.getStatus();

        if (loanStatus == null ||
                (!"APPROVED".equalsIgnoreCase(
                        loanStatus
                ) &&
                !"ACTIVE".equalsIgnoreCase(
                        loanStatus
                ))) {

            throw new RuntimeException(
                    "Payment is not available for this loan"
            );
        }

        // -----------------------------------------------------
        // EMI AMOUNT FROM BACKEND
        // -----------------------------------------------------

        Double emiAmount =
                loan.getEmiAmount();

        if (emiAmount == null ||
                emiAmount <= 0) {

            throw new RuntimeException(
                    "Invalid EMI amount"
            );
        }

        // -----------------------------------------------------
        // PREVENT DUPLICATE PENDING PAYMENT
        // -----------------------------------------------------

        List<CustomerPayment> existingPayments =
                customerPaymentRepository
                        .findByLoanIdOrderByCreatedAtDesc(
                                loanId
                        );

        for (CustomerPayment existing :
                existingPayments) {

            if ("PENDING".equalsIgnoreCase(
                    existing.getStatus())) {

                throw new RuntimeException(
                        "A payment is already pending for this loan"
                );
            }
        }

        // -----------------------------------------------------
        // CREATE PAYMENT
        // -----------------------------------------------------

        CustomerPayment payment =
                new CustomerPayment();

        payment.setCustomerId(
                customerId
        );

        payment.setCustomerName(
                member.getName()
        );

        payment.setLoanId(
                loanId
        );

        // IMPORTANT:
        // Amount comes only from backend.
        payment.setAmount(
                emiAmount
        );

        payment.setPaymentMode(
                "UPI"
        );

        payment.setStatus(
                "PENDING"
        );

        payment.setVerificationStatus(
                "PENDING"
        );

        CustomerPayment savedPayment =
                customerPaymentRepository.save(
                        payment
                );

        // -----------------------------------------------------
        // CREATE CASHFREE ORDER
        // -----------------------------------------------------

        return createCashfreeOrder(
                savedPayment,
                member
        );
    }

    // =========================================================
    // CREATE CASHFREE ORDER
    // =========================================================

    private CustomerPaymentResponse
    createCashfreeOrder(
            CustomerPayment payment,
            Member member) {

        try {

            // -------------------------------------------------
            // CUSTOMER PHONE
            // -------------------------------------------------

            String customerPhone =
                    member.getPhone();

            if (customerPhone == null ||
                    customerPhone.trim()
                            .isEmpty()) {

                throw new RuntimeException(
                        "Customer phone number is required"
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
            // ORDER ID
            // -------------------------------------------------

            String orderId =
                    "customer_emi_"
                            + payment.getId()
                            + "_"
                            + UUID.randomUUID()
                                    .toString()
                                    .replace("-", "")
                                    .substring(0, 12);

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
                    payment.getCustomerId()
            );

            customerDetails.put(
                    "customer_name",
                    payment.getCustomerName()
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
                            + "/customer/payment-return"
                            + "?order_id={order_id}"
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
                    "Customer EMI Payment - "
                            + payment.getLoanId()
            );

            // -------------------------------------------------
            // TAGS
            // -------------------------------------------------

            JSONObject orderTags =
                    new JSONObject();

            orderTags.put(
                    "customer_payment_id",
                    String.valueOf(
                            payment.getId()
                    )
            );

            orderTags.put(
                    "loan_id",
                    payment.getLoanId()
            );

            orderTags.put(
                    "customer_id",
                    payment.getCustomerId()
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
            // HTTP REQUEST
            // -------------------------------------------------

            HttpRequest httpRequest =
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
                            httpRequest,
                            HttpResponse.BodyHandlers
                                    .ofString()
                    );

            int statusCode =
                    response.statusCode();

            String responseBody =
                    response.body();

            System.out.println(
                    "CUSTOMER CASHFREE STATUS: "
                            + statusCode
            );

            System.out.println(
                    "CUSTOMER CASHFREE RESPONSE: "
                            + responseBody
            );

            if (statusCode < 200 ||
                    statusCode >= 300) {

                payment.setStatus(
                        "FAILED"
                );

                payment.setVerificationStatus(
                        "FAILED"
                );

                customerPaymentRepository.save(
                        payment
                );

                throw new RuntimeException(
                        "Cashfree order creation failed: "
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

            if (returnedOrderId == null ||
                    returnedOrderId.trim()
                            .isEmpty()) {

                throw new RuntimeException(
                        "Cashfree order ID was not returned"
                );
            }

            if (paymentSessionId == null ||
                    paymentSessionId.trim()
                            .isEmpty()) {

                throw new RuntimeException(
                        "Cashfree payment session was not returned"
                );
            }

            // -------------------------------------------------
            // SAVE CASHFREE DETAILS
            // -------------------------------------------------

            payment.setCashfreeOrderId(
                    returnedOrderId
            );

            payment.setCashfreePaymentSessionId(
                    paymentSessionId
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

            customerPaymentRepository.save(
                    payment
            );

            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            CustomerPaymentResponse result =
                    buildResponse(
                            payment
                    );

            result.setOrderId(
                    returnedOrderId
            );

            result.setCfOrderId(
                    cfOrderId
            );

            result.setPaymentSessionId(
                    paymentSessionId
            );

            return result;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to create customer payment: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // CHECK CASHFREE STATUS
    // =========================================================

    public CustomerPaymentResponse
    checkPaymentStatus(
            String authenticatedCustomerId,
            Long paymentId) {

        try {

            String customerId =
                    normalizeCustomerId(
                            authenticatedCustomerId
                    );

            CustomerPayment payment =
                    customerPaymentRepository
                            .findById(paymentId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Payment not found"
                                    )
                            );

            // -------------------------------------------------
            // SECURITY
            // -------------------------------------------------

            if (!customerId.equals(
                    normalizeCustomerId(
                            payment.getCustomerId()
                    )
            )) {

                throw new RuntimeException(
                        "You are not authorized to access this payment"
                );
            }

            // -------------------------------------------------
            // ALREADY SUCCESS
            // -------------------------------------------------

            if ("SUCCESS".equalsIgnoreCase(
                    payment.getStatus())) {

                return buildResponse(
                        payment
                );
            }

            // -------------------------------------------------
            // ORDER ID
            // -------------------------------------------------

            String orderId =
                    payment.getCashfreeOrderId();

            if (orderId == null ||
                    orderId.trim()
                            .isEmpty()) {

                throw new RuntimeException(
                        "Cashfree order ID not found"
                );
            }

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

            if (response.statusCode() < 200 ||
                    response.statusCode() >= 300) {

                throw new RuntimeException(
                        "Failed to verify payment with Cashfree"
                );
            }

            JSONArray payments =
                    new JSONArray(
                            response.body()
                    );

            JSONObject successfulPayment =
                    null;

            JSONObject latestPayment =
                    null;

            for (int i = 0;
                 i < payments.length();
                 i++) {

                JSONObject current =
                        payments.getJSONObject(i);

                latestPayment =
                        current;

                String paymentStatus =
                        current.optString(
                                "payment_status"
                        );

                if ("SUCCESS".equalsIgnoreCase(
                        paymentStatus
                )) {

                    successfulPayment =
                            current;

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

                if (receivedAmount < 0 ||
                        Math.abs(
                                receivedAmount
                                        - payment.getAmount()
                        ) > 0.01) {

                    payment.setStatus(
                            "FAILED"
                    );

                    payment.setVerificationStatus(
                            "FAILED"
                    );

                    customerPaymentRepository.save(
                            payment
                    );

                    throw new RuntimeException(
                            "Payment amount mismatch"
                    );
                }

                String cfPaymentId =
                        successfulPayment.optString(
                                "cf_payment_id",
                                null
                        );

                String bankReference =
                        successfulPayment.optString(
                                "bank_reference",
                                null
                        );

                payment.setCashfreePaymentId(
                        cfPaymentId
                );

                if (bankReference != null &&
                        !bankReference.trim()
                                .isEmpty()) {

                    payment.setTransactionReference(
                            bankReference
                    );

                } else if (cfPaymentId != null &&
                        !cfPaymentId.trim()
                                .isEmpty()) {

                    payment.setTransactionReference(
                            cfPaymentId
                    );
                }

                payment.setStatus(
                        "SUCCESS"
                );

                payment.setVerificationStatus(
                        "VERIFIED"
                );

                payment.setPaidAt(
                        LocalDateTime.now()
                );

                if (payment.getReceiptNumber() == null ||
                        payment.getReceiptNumber()
                                .trim()
                                .isEmpty()) {

                    payment.setReceiptNumber(
                            generateReceiptNumber()
                    );
                }

                customerPaymentRepository.save(
                        payment
                );

                return buildResponse(
                        payment
                );
            }

            // -------------------------------------------------
            // FAILED / PENDING
            // -------------------------------------------------

            if (latestPayment != null) {

                String latestStatus =
                        latestPayment.optString(
                                "payment_status"
                        );

                if ("FAILED".equalsIgnoreCase(
                        latestStatus
                )) {

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

                customerPaymentRepository.save(
                        payment
                );
            }

            return buildResponse(
                    payment
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to check customer payment status: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // =========================================================
    // PAYMENT HISTORY
    // =========================================================

    public List<CustomerPaymentResponse>
    getMyPaymentHistory(
            String authenticatedCustomerId) {

        String customerId =
                normalizeCustomerId(
                        authenticatedCustomerId
                );

        List<CustomerPayment> payments =
                customerPaymentRepository
                        .findByCustomerIdOrderByCreatedAtDesc(
                                customerId
                        );

        List<CustomerPaymentResponse> result =
                new ArrayList<>();

        for (CustomerPayment payment :
                payments) {

            result.add(
                    buildResponse(
                            payment
                    )
            );
        }

        return result;
    }

    // =========================================================
    // GET PAYMENT BY ID
    // =========================================================

    public CustomerPaymentResponse
    getMyPaymentById(
            String authenticatedCustomerId,
            Long paymentId) {

        String customerId =
                normalizeCustomerId(
                        authenticatedCustomerId
                );

        CustomerPayment payment =
                customerPaymentRepository
                        .findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"
                                )
                        );

        if (!customerId.equals(
                normalizeCustomerId(
                        payment.getCustomerId()
                )
        )) {

            throw new RuntimeException(
                    "You are not authorized to access this payment"
            );
        }

        return buildResponse(
                payment
        );
    }

    // =========================================================
    // BUILD RESPONSE
    // =========================================================

    private CustomerPaymentResponse
    buildResponse(
            CustomerPayment payment) {

        CustomerPaymentResponse response =
                new CustomerPaymentResponse();

        response.setPaymentId(
                payment.getId()
        );

        response.setCustomerId(
                payment.getCustomerId()
        );

        response.setCustomerName(
                payment.getCustomerName()
        );

        response.setLoanId(
                payment.getLoanId()
        );

        response.setAmount(
                payment.getAmount()
        );

        response.setPaymentMode(
                payment.getPaymentMode()
        );

        response.setStatus(
                payment.getStatus()
        );

        response.setVerificationStatus(
                payment.getVerificationStatus()
        );

        response.setOrderId(
                payment.getCashfreeOrderId()
        );

        response.setPaymentSessionId(
                payment.getCashfreePaymentSessionId()
        );

        response.setCashfreePaymentId(
                payment.getCashfreePaymentId()
        );

        response.setTransactionReference(
                payment.getTransactionReference()
        );

        response.setReceiptNumber(
                payment.getReceiptNumber()
        );

        response.setCreatedAt(
                payment.getCreatedAt()
        );

        response.setPaidAt(
                payment.getPaidAt()
        );

        return response;
    }

    // =========================================================
    // NORMALIZE CUSTOMER ID
    // =========================================================

    private String normalizeCustomerId(
            String customerId) {

        if (customerId == null ||
                customerId.trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Customer authentication is required"
            );
        }

        return customerId
                .trim()
                .toUpperCase();
    }

    // =========================================================
    // RECEIPT NUMBER
    // =========================================================

    private String generateReceiptNumber() {

        String randomPart =
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();

        return "CUST-REC-"
                + randomPart;
    }
}