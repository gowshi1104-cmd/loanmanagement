import jsPDF from "jspdf";

/* =========================================================
   HELPERS
========================================================= */

/**
 * Convert File / Blob to base64
 */
const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
};

/**
 * Currency
 */
const formatCurrency = (value) => {
  const number = Number(value || 0);

  return `Rs. ${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Date
 */
const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

/**
 * Safe value
 */
const safeValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "-";
  }

  return String(value);
};

/**
 * Horizontal line
 */
const drawLine = (doc, x1, y, x2) => {
  doc.setDrawColor(190, 198, 208);
  doc.setLineWidth(0.3);
  doc.line(x1, y, x2, y);
};

/**
 * Section heading
 */
const drawSectionHeading = (
  doc,
  title,
  y,
  pageWidth
) => {
  const margin = 15;
  const width = pageWidth - margin * 2;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(180, 190, 200);
  doc.setLineWidth(0.3);

  doc.rect(
    margin,
    y,
    width,
    10,
    "FD"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);

  doc.text(
    title,
    margin + 4,
    y + 6.7
  );

  return y + 15;
};

/**
 * Draw bordered field
 */
const drawBoxField = (
  doc,
  label,
  value,
  x,
  y,
  width,
  height = 17
) => {
  doc.setDrawColor(190, 198, 210);
  doc.setLineWidth(0.3);

  doc.rect(
    x,
    y,
    width,
    height
  );

  /* Label */
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);

  doc.text(
    label,
    x + 3,
    y + 5
  );

  /* Value */
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);

  const text = safeValue(value);

  const lines = doc.splitTextToSize(
    text,
    width - 6
  );

  doc.text(
    lines.slice(0, 2),
    x + 3,
    y + 11
  );
};

/**
 * Declaration paragraph
 */
const drawParagraph = (
  doc,
  text,
  x,
  y,
  width,
  options = {}
) => {
  const {
    fontSize = 8.5,
    lineHeight = 4.5,
    color = [51, 65, 85],
    bold = false,
  } = options;

  doc.setFont(
    "helvetica",
    bold ? "bold" : "normal"
  );

  doc.setFontSize(fontSize);

  doc.setTextColor(
    color[0],
    color[1],
    color[2]
  );

  const lines = doc.splitTextToSize(
    text,
    width
  );

  doc.text(
    lines,
    x,
    y
  );

  return y + lines.length * lineHeight;
};

/**
 * Checkbox
 */
const drawCheckbox = (
  doc,
  x,
  y,
  checked = true
) => {
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.4);

  doc.rect(
    x,
    y - 4,
    4,
    4
  );

  if (checked) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);

    doc.text(
      "✓",
      x + 0.6,
      y - 0.7
    );
  }
};

/* =========================================================
   MAIN PDF
========================================================= */

export const generateLoanApplicationPdf = async ({
  loan,
  documents,
  savedLoanId,
  customerDocument = null,
}) => {
  console.log(
    "Professional Loan PDF generation started"
  );

  console.log(
    "Loan:",
    loan
  );

  console.log(
    "Documents:",
    documents
  );

  /* =======================================================
     CREATE PDF
  ======================================================= */

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const margin = 15;

  const contentWidth =
    pageWidth - margin * 2;

  /* =======================================================
     IMPORTANT:
     ONLY loan.loanId MUST BE USED AS LOAN ID
     
     DO NOT USE:
     loan.id
     savedLoanId
  ======================================================= */

  const loanId =
    loan?.loanId !== null &&
    loan?.loanId !== undefined &&
    loan?.loanId !== ""
      ? loan.loanId
      : "-";

  /*
   * Application / Loan ID in PDF should also show
   * the actual Loan ID.
   */
  const applicationId = loanId;

  console.log(
    "PDF Loan ID:",
    loanId
  );

  /* =======================================================
     CUSTOMER PHOTO
  ======================================================= */

  let photoData = null;

  if (documents?.photo) {
    try {
      photoData =
        await fileToDataUrl(
          documents.photo
        );
    } catch (error) {
      console.error(
        "Photo conversion failed:",
        error
      );
    }
  }

  /* =======================================================
     PAGE HEADER
  ======================================================= */

  const drawPageHeader = () => {
    doc.setFillColor(
      15,
      23,
      42
    );

    doc.rect(
      0,
      0,
      pageWidth,
      30,
      "F"
    );

    /* Company name */

    doc.setTextColor(
      255,
      255,
      255
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(18);

    doc.text(
      "LOAN MS",
      margin,
      12
    );

    /* Subtitle */

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8.5);

    doc.text(
      "Loan Management System",
      margin,
      19
    );

    /* Right side */

    doc.setFontSize(8);

    doc.text(
      "LOAN APPLICATION",
      pageWidth - margin,
      11,
      {
        align: "right",
      }
    );

    /*
     * IMPORTANT:
     * This now shows loanId only.
     */
    doc.text(
      `Loan ID: ${loanId}`,
      pageWidth - margin,
      19,
      {
        align: "right",
      }
    );
  };

  /* =======================================================
     PAGE FOOTER
  ======================================================= */

  const drawPageFooter = () => {
    const totalPages =
      doc.internal.getNumberOfPages();

    for (
      let page = 1;
      page <= totalPages;
      page++
    ) {
      doc.setPage(page);

      doc.setDrawColor(
        210,
        214,
        220
      );

      doc.setLineWidth(0.3);

      doc.line(
        margin,
        pageHeight - 15,
        pageWidth - margin,
        pageHeight - 15
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7);

      doc.setTextColor(
        100,
        116,
        139
      );

      doc.text(
        "Loan Management System",
        margin,
        pageHeight - 9
      );

      doc.text(
        `Loan ID: ${loanId}`,
        pageWidth / 2,
        pageHeight - 9,
        {
          align: "center",
        }
      );

      doc.text(
        `Page ${page} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 9,
        {
          align: "right",
        }
      );
    }
  };

  /* =======================================================
     PAGE CONTROL
  ======================================================= */

  let y = 40;

  drawPageHeader();

  const ensureSpace = (
    requiredHeight = 25
  ) => {
    if (
      y + requiredHeight >
      pageHeight - 25
    ) {
      doc.addPage();

      drawPageHeader();

      y = 40;

      return true;
    }

    return false;
  };

  const ensureSectionSpace = (
    requiredHeight = 45
  ) => {
    if (
      y + requiredHeight >
      pageHeight - 25
    ) {
      doc.addPage();

      drawPageHeader();

      y = 40;
    }
  };

  /* =======================================================
     TITLE
  ======================================================= */

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(16);

  doc.setTextColor(
    15,
    23,
    42
  );

  doc.text(
    "LOAN APPLICATION & CUSTOMER DECLARATION",
    margin,
    y
  );

  y += 6;

  drawLine(
    doc,
    margin,
    y,
    pageWidth - margin
  );

  y += 10;

  /* =======================================================
     APPLICATION META
  ======================================================= */

  drawBoxField(
    doc,
    "LOAN ID",
    loanId,
    margin,
    y,
    85
  );

  drawBoxField(
    doc,
    "APPLICATION DATE",
    formatDate(
      loan?.loanDate
    ),
    110,
    y,
    85
  );

  y += 24;

  /* =======================================================
     1. APPLICANT DETAILS
  ======================================================= */

  ensureSectionSpace(75);

  y = drawSectionHeading(
    doc,
    "1. APPLICANT DETAILS",
    y,
    pageWidth
  );

  /* =======================================================
     PHOTO
  ======================================================= */

  const applicantPhotoX =
    pageWidth - margin - 35;

  const applicantPhotoY =
    y;

  const applicantPhotoW =
    35;

  const applicantPhotoH =
    45;

  doc.setDrawColor(
    150,
    160,
    175
  );

  doc.setLineWidth(0.5);

  doc.rect(
    applicantPhotoX,
    applicantPhotoY,
    applicantPhotoW,
    applicantPhotoH
  );

  if (photoData) {
    try {
      const imageType =
        photoData.startsWith(
          "data:image/png"
        )
          ? "PNG"
          : "JPEG";

      doc.addImage(
        photoData,
        imageType,
        applicantPhotoX + 1,
        applicantPhotoY + 1,
        applicantPhotoW - 2,
        applicantPhotoH - 2
      );
    } catch (error) {
      doc.setFontSize(7);

      doc.setTextColor(
        100,
        116,
        139
      );

      doc.text(
        "PHOTO",
        applicantPhotoX +
          applicantPhotoW / 2,
        applicantPhotoY + 23,
        {
          align: "center",
        }
      );
    }
  } else {
    doc.setFontSize(7);

    doc.setTextColor(
      100,
      116,
      139
    );

    doc.text(
      "PHOTO",
      applicantPhotoX +
        applicantPhotoW / 2,
      applicantPhotoY + 22,
      {
        align: "center",
      }
    );
  }

  /* =======================================================
     APPLICANT ROW 1
  ======================================================= */

  drawBoxField(
    doc,
    "CUSTOMER ID",
    loan?.customerId,
    margin,
    y,
    60
  );

  drawBoxField(
    doc,
    "APPLICANT NAME",
    loan?.customerName,
    80,
    y,
    70
  );

  y += 21;

  /* =======================================================
     APPLICANT ROW 2
  ======================================================= */

  drawBoxField(
    doc,
    "AADHAAR NUMBER",
    loan?.aadhaarNumber,
    margin,
    y,
    65
  );

  drawBoxField(
    doc,
    "PAN NUMBER",
    loan?.panNumber,
    85,
    y,
    65
  );

  y += 21;

  /* =======================================================
     APPLICANT ROW 3
  ======================================================= */

  drawBoxField(
    doc,
    "MONTHLY INCOME",
    loan?.monthlyIncome
      ? formatCurrency(
          loan.monthlyIncome
        )
      : "-",
    margin,
    y,
    65
  );

  drawBoxField(
    doc,
    "CUSTOMER DOCUMENT",
    customerDocument?.fileName ||
      "Not available",
    85,
    y,
    65
  );

  y += 24;

  /* =======================================================
     2. LOAN DETAILS
  ======================================================= */

  ensureSectionSpace(95);

  y = drawSectionHeading(
    doc,
    "2. LOAN DETAILS",
    y,
    pageWidth
  );

  drawBoxField(
    doc,
    "LOAN ID",
    loanId,
    margin,
    y,
    85
  );

  drawBoxField(
    doc,
    "LOAN AMOUNT",
    formatCurrency(
      loan?.loanAmount
    ),
    110,
    y,
    85
  );

  y += 21;

  drawBoxField(
    doc,
    "INTEREST RATE",
    `${loan?.interestRate ?? "-"}%`,
    margin,
    y,
    85
  );

  drawBoxField(
    doc,
    "TENURE",
    loan?.tenureMonths
      ? `${loan.tenureMonths} Months`
      : "-",
    110,
    y,
    85
  );

  y += 21;

  drawBoxField(
    doc,
    "MONTHLY EMI",
    formatCurrency(
      loan?.emiAmount
    ),
    margin,
    y,
    85
  );

  drawBoxField(
    doc,
    "LOAN DATE",
    formatDate(
      loan?.loanDate
    ),
    110,
    y,
    85
  );

  y += 21;

  drawBoxField(
    doc,
    "EXPECTED DISBURSAL DATE",
    formatDate(
      loan?.disbursalExpectedDate
    ),
    margin,
    y,
    85
  );

  drawBoxField(
    doc,
    "FIRST EMI DATE",
    formatDate(
      loan?.nextEmiDate
    ),
    110,
    y,
    85
  );

  y += 21;

  drawBoxField(
    doc,
    "LOAN STATUS",
    loan?.status || "PENDING",
    margin,
    y,
    85
  );

  drawBoxField(
    doc,
    "APPLICATION STATUS",
    loan?.status || "PENDING",
    110,
    y,
    85
  );

  y += 25;

  /* =======================================================
     3. KYC & DOCUMENTS DECLARATION
  ======================================================= */

  ensureSectionSpace(75);

  y = drawSectionHeading(
    doc,
    "3. KYC & DOCUMENTS DECLARATION",
    y,
    pageWidth
  );

  const kycDeclaration =
    "I confirm that the identity and supporting documents submitted by me in connection with this loan application are true and belong to me. I have provided the required documents for verification and understand that the information provided may be verified by the lending institution.";

  y = drawParagraph(
    doc,
    kycDeclaration,
    margin,
    y,
    contentWidth
  );

  y += 7;

  /* =======================================================
     DOCUMENT CHECKLIST
  ======================================================= */

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(9);

  doc.setTextColor(
    30,
    41,
    59
  );

  doc.text(
    "Document Submission Checklist",
    margin,
    y
  );

  y += 8;

  /*
   * IMPORTANT:
   *
   * Payment form-la nominee ID / proof upload pannumbodhu
   * documents.nomineeProof-ku file pass aaganum.
   */

  const documentItems = [
    {
      label: "Aadhaar Card",
      file: documents?.aadhaar,
    },
    {
      label: "PAN Card",
      file: documents?.pan,
    },
    {
      label: "Nominee ID / Proof",
      file:
        documents?.nomineeProof ||
        documents?.nomineeId ||
        documents?.nomineeDocument,
    },
    {
      label: "Income Proof",
      file:
        documents?.incomeProof ||
        documents?.incomeDocument,
    },
    {
      label: "Ration Card",
      file: documents?.rationCard,
    },
  ];

  documentItems.forEach(
    (item) => {
      drawCheckbox(
        doc,
        margin,
        y,
        Boolean(item.file)
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8.5);

      doc.setTextColor(
        51,
        65,
        85
      );

      doc.text(
        item.label,
        margin + 8,
        y
      );

      const status =
        item.file
          ? "SUBMITTED"
          : "NOT PROVIDED";

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setTextColor(
        item.file
          ? 22
          : 180,
        item.file
          ? 163
          : 38,
        item.file
          ? 74
          : 38
      );

      doc.text(
        status,
        pageWidth - margin,
        y,
        {
          align: "right",
        }
      );

      y += 7;
    }
  );

  y += 8;

  /* =======================================================
     4. NOMINEE INFORMATION & DECLARATION
  ======================================================= */

  ensureSectionSpace(95);

  y = drawSectionHeading(
    doc,
    "4. NOMINEE INFORMATION & DECLARATION",
    y,
    pageWidth
  );

  drawBoxField(
    doc,
    "NOMINEE NAME",
    loan?.nomineeName,
    margin,
    y,
    85
  );

  drawBoxField(
    doc,
    "RELATIONSHIP",
    loan?.nomineeRelationship,
    110,
    y,
    85
  );

  y += 21;

  drawBoxField(
    doc,
    "NOMINEE MOBILE",
    loan?.nomineeMobile,
    margin,
    y,
    85
  );

  drawBoxField(
    doc,
    "NOMINEE AADHAAR",
    loan?.nomineeAadhaarNumber,
    110,
    y,
    85
  );

  y += 23;

  const nomineeDeclaration =
    "I confirm that the nominee details provided by me are correct. I have voluntarily nominated the person mentioned in this application and understand that the nominee information has been provided with my knowledge and consent.";

  y = drawParagraph(
    doc,
    nomineeDeclaration,
    margin,
    y,
    contentWidth
  );

  y += 10;

  /* =======================================================
     5. LOAN REPAYMENT DECLARATION
  ======================================================= */

  ensureSectionSpace(100);

  y = drawSectionHeading(
    doc,
    "5. LOAN REPAYMENT DECLARATION",
    y,
    pageWidth
  );

  const repaymentRules = [
    "I hereby confirm that I am voluntarily applying for and accepting the above-mentioned loan facility. I have understood the loan amount, applicable interest rate, tenure and EMI obligations.",

    "I undertake to pay my EMI on or before the scheduled due date every month.",

    "In the event that I fail to make an EMI payment on time, I understand that the applicable overdue amount or charges may become payable along with the outstanding EMI, subject to the applicable terms and conditions.",

    "I understand that timely repayment of the loan is my responsibility and that payment records may be maintained as part of the loan account history.",

    "I agree to keep my contact details and other relevant information updated with the lending institution during the loan tenure.",

    "I understand that any request for changes to the loan, repayment schedule or other account information may be subject to applicable approval procedures.",
  ];

  repaymentRules.forEach(
    (rule, index) => {
      ensureSpace(18);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8.5);

      doc.setTextColor(
        30,
        41,
        59
      );

      doc.text(
        `${index + 1}.`,
        margin,
        y
      );

      const textX =
        margin + 6;

      y = drawParagraph(
        doc,
        rule,
        textX,
        y,
        contentWidth - 6,
        {
          fontSize: 8.5,
          lineHeight: 4.5,
        }
      );

      y += 4;
    }
  );

  /* =======================================================
     6. APPLICANT CONSENT
  ======================================================= */

  ensureSectionSpace(80);

  y = drawSectionHeading(
    doc,
    "6. APPLICANT CONSENT",
    y,
    pageWidth
  );

  const consent =
    "I confirm that I have read and understood the information contained in this loan application. I am accepting the loan facility with my full knowledge and consent and agree to comply with the applicable repayment terms and conditions.";

  y = drawParagraph(
    doc,
    consent,
    margin,
    y,
    contentWidth
  );

  y += 7;

  const consentRules = [
    "I have reviewed the personal and loan information provided in this application.",

    "I confirm that the information furnished is complete and accurate to the best of my knowledge.",

    "I understand my repayment responsibility and EMI obligations.",

    "I consent to the verification of the information and documents submitted by me.",

    "I understand that approval and disbursal are subject to the applicable loan policies and procedures.",
  ];

  consentRules.forEach(
    (rule) => {
      ensureSpace(12);

      drawCheckbox(
        doc,
        margin,
        y,
        true
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8.5);

      doc.setTextColor(
        51,
        65,
        85
      );

      const lines =
        doc.splitTextToSize(
          rule,
          contentWidth - 10
        );

      doc.text(
        lines,
        margin + 8,
        y
      );

      y +=
        lines.length * 4 +
        5;
    }
  );

  y += 6;

  /* =======================================================
     7. GENERAL DECLARATION
  ======================================================= */

  ensureSectionSpace(75);

  y = drawSectionHeading(
    doc,
    "7. GENERAL DECLARATION",
    y,
    pageWidth
  );

  const generalDeclaration =
    "I declare that all information furnished by me is true, complete and accurate to the best of my knowledge. I understand that providing false or misleading information may result in rejection, cancellation or other action in accordance with applicable terms and law.";

  y = drawParagraph(
    doc,
    generalDeclaration,
    margin,
    y,
    contentWidth
  );

  y += 8;

  const additionalRules = [
    "The applicant is responsible for the accuracy of all information submitted in the application.",

    "All documents submitted for verification must belong to the applicant or the relevant person identified in the application.",

    "Any material change in the applicant's information should be communicated to the lending institution as required.",

    "Loan approval does not by itself constitute a guarantee of immediate disbursal where additional verification or documentation is required.",

    "The loan shall be governed by the applicable terms, conditions, policies and procedures of the lending institution.",
  ];

  additionalRules.forEach(
    (rule) => {
      ensureSpace(15);

      drawCheckbox(
        doc,
        margin,
        y,
        true
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        51,
        65,
        85
      );

      const lines =
        doc.splitTextToSize(
          rule,
          contentWidth - 8
        );

      doc.text(
        lines,
        margin + 8,
        y
      );

      y +=
        lines.length * 4 +
        5;
    }
  );

  /* =======================================================
     8. IMPORTANT LOAN TERMS & CONDITIONS
  ======================================================= */

  ensureSectionSpace(100);

  y = drawSectionHeading(
    doc,
    "8. IMPORTANT LOAN TERMS & CONDITIONS",
    y,
    pageWidth
  );

  const terms = [
    "The loan amount, interest rate, tenure and EMI shown in this application are based on the loan information available at the time of application.",

    "The applicant shall comply with the agreed repayment schedule and applicable EMI due dates.",

    "Delayed repayment may result in applicable overdue amounts, charges or other consequences according to the applicable terms and conditions.",

    "The applicant shall maintain sufficient funds through the applicable repayment method to meet scheduled EMI obligations.",

    "Any modification to the loan account shall be subject to the applicable approval and verification process.",

    "The applicant shall provide additional information or documents when reasonably required for verification, compliance or account servicing.",

    "The lending institution reserves the right to verify the information and documents submitted in connection with the loan application.",

    "Loan approval, verification and disbursal are subject to applicable internal policies, eligibility requirements and documentation requirements.",

    "The applicant acknowledges that this document records the information and declarations provided as part of the loan application process.",
  ];

  terms.forEach(
    (term, index) => {
      ensureSpace(18);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8);

      doc.setTextColor(
        30,
        41,
        59
      );

      doc.text(
        `${index + 1}.`,
        margin,
        y
      );

      const lines =
        doc.splitTextToSize(
          term,
          contentWidth - 8
        );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        lines,
        margin + 7,
        y
      );

      y +=
        lines.length * 4 +
        4;
    }
  );

  /* =======================================================
     9. SIGNATURE & ACKNOWLEDGEMENT
  ======================================================= */

  ensureSectionSpace(90);

  y = drawSectionHeading(
    doc,
    "9. SIGNATURE & ACKNOWLEDGEMENT",
    y,
    pageWidth
  );

  const signatureText =
    "By signing below, the applicant confirms that the information, declarations and consent provided in this application have been read, understood and accepted.";

  y = drawParagraph(
    doc,
    signatureText,
    margin,
    y,
    contentWidth
  );

  y += 15;

  /* =======================================================
     SIGNATURE COLUMNS
  ======================================================= */

  const leftX = 20;
  const rightX = 120;

  const signatureLineWidth = 55;

  doc.setDrawColor(
    120,
    130,
    145
  );

  doc.setLineWidth(0.4);

  doc.line(
    leftX,
    y,
    leftX + signatureLineWidth,
    y
  );

  doc.line(
    rightX,
    y,
    rightX + signatureLineWidth,
    y
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    51,
    65,
    85
  );

  doc.text(
    "Applicant Signature",
    leftX,
    y + 6
  );

  doc.text(
    "Loan Officer / Authorized Person",
    rightX,
    y + 6
  );

  y += 15;

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(8);

  doc.text(
    `Name: ${safeValue(
      loan?.customerName
    )}`,
    leftX,
    y
  );

  doc.text(
    "Name: __________________________",
    rightX,
    y
  );

  y += 7;

  doc.text(
    `Date: ${formatDate(
      loan?.loanDate
    )}`,
    leftX,
    y
  );

  doc.text(
    "Date: __________________________",
    rightX,
    y
  );

  y += 15;

  /* =======================================================
     ACKNOWLEDGEMENT BOX
  ======================================================= */

  ensureSpace(35);

  doc.setFillColor(
    248,
    250,
    252
  );

  doc.setDrawColor(
    203,
    213,
    225
  );

  doc.roundedRect(
    margin,
    y,
    contentWidth,
    22,
    2,
    2,
    "FD"
  );

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.setFontSize(8);

  doc.setTextColor(
    30,
    41,
    59
  );

  doc.text(
    "ACKNOWLEDGEMENT",
    margin + 5,
    y + 7
  );

  doc.setFont(
    "helvetica",
    "normal"
  );

  doc.setFontSize(7.5);

  doc.setTextColor(
    71,
    85,
    105
  );

  const acknowledgement =
    "This document forms part of the loan application record and should be retained by the applicant and the lending institution for reference.";

  const acknowledgementLines =
    doc.splitTextToSize(
      acknowledgement,
      contentWidth - 10
    );

  doc.text(
    acknowledgementLines,
    margin + 5,
    y + 13
  );

  /* =======================================================
     FOOTER
  ======================================================= */

  drawPageFooter();

  /* =======================================================
     FILE NAME
  ======================================================= */

  const customerName = (
    loan?.customerName ||
    "Customer"
  )
    .replace(
      /[^a-zA-Z0-9]/g,
      "_"
    );

  /*
   * Filename also uses loanId only.
   * Example:
   * Loan_Application_Bhavik_LN010.pdf
   */

  const fileName =
    `Loan_Application_${customerName}_${loanId}.pdf`;

  /* =======================================================
     DOWNLOAD
  ======================================================= */

  console.log(
    "Downloading professional PDF:",
    fileName
  );

  doc.save(fileName);

  return fileName;
};