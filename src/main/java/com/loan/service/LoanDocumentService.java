package com.loan.service;

import com.loan.entity.Loan;
import com.loan.entity.LoanDocument;
import com.loan.repository.LoanDocumentRepository;
import com.loan.repository.LoanRepository;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class LoanDocumentService {

    // =========================================================
    // CONFIG
    // =========================================================

    private static final String UPLOAD_DIRECTORY =
            "uploads/loan-documents";

    private static final long MAX_FILE_SIZE =
            5 * 1024 * 1024;

    // =========================================================
    // ALLOWED FILE TYPES
    // =========================================================

    private static final List<String> ALLOWED_CONTENT_TYPES =
            List.of(
                    "application/pdf",
                    "image/jpeg",
                    "image/jpg",
                    "image/png"
            );

    // =========================================================
    // ALLOWED DOCUMENT TYPES
    // =========================================================

    private static final List<String> ALLOWED_DOCUMENT_TYPES =
            List.of(
                    "AADHAAR",
                    "PAN",
                    "RATION_CARD",
                    "PHOTO"
            );

    // =========================================================
    // REPOSITORIES
    // =========================================================

    private final LoanDocumentRepository loanDocumentRepository;

    private final LoanRepository loanRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public LoanDocumentService(
            LoanDocumentRepository loanDocumentRepository,
            LoanRepository loanRepository
    ) {

        this.loanDocumentRepository =
                loanDocumentRepository;

        this.loanRepository =
                loanRepository;
    }

    // =========================================================
    // UPLOAD SINGLE DOCUMENT
    // =========================================================

    public LoanDocument uploadDocument(
            Long loanId,
            String documentType,
            MultipartFile file
    ) throws IOException {

        // -----------------------------------------------------
        // VALIDATE LOAN ID
        // -----------------------------------------------------

        if (loanId == null) {

            throw new IllegalArgumentException(
                    "Loan ID is required"
            );
        }

        // -----------------------------------------------------
        // FIND LOAN
        // -----------------------------------------------------

        Loan loan =
                loanRepository.findById(loanId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Loan not found with ID: "
                                                + loanId
                                )
                        );

        // -----------------------------------------------------
        // VALIDATE DOCUMENT TYPE
        // -----------------------------------------------------

        String normalizedDocumentType =
                normalizeDocumentType(
                        documentType
                );

        // -----------------------------------------------------
        // VALIDATE FILE
        // -----------------------------------------------------

        validateFile(file);

        // -----------------------------------------------------
        // CREATE DIRECTORY
        // -----------------------------------------------------

        Path uploadPath =
                Paths.get(
                        UPLOAD_DIRECTORY
                );

        Files.createDirectories(
                uploadPath
        );

        // -----------------------------------------------------
        // ORIGINAL FILE NAME
        // -----------------------------------------------------

        String originalFileName =
                file.getOriginalFilename();

        if (originalFileName == null ||
                originalFileName.isBlank()) {

            originalFileName =
                    "document";
        }

        originalFileName =
                Paths.get(
                        originalFileName
                )
                .getFileName()
                .toString();

        // -----------------------------------------------------
        // STORED FILE NAME
        // -----------------------------------------------------

        String extension =
                getFileExtension(
                        originalFileName
                );

        String storedFileName =
                UUID.randomUUID()
                        .toString()
                + extension;

        // -----------------------------------------------------
        // FILE PATH
        // -----------------------------------------------------

        Path targetPath =
                uploadPath.resolve(
                        storedFileName
                );

        // -----------------------------------------------------
        // SAVE FILE
        // -----------------------------------------------------

        Files.copy(
                file.getInputStream(),
                targetPath
        );

        // -----------------------------------------------------
        // CREATE ENTITY
        // -----------------------------------------------------

        LoanDocument document =
                new LoanDocument();

        document.setLoan(
                loan
        );

        document.setDocumentType(
                normalizedDocumentType
        );

        document.setOriginalFileName(
                originalFileName
        );

        document.setStoredFileName(
                storedFileName
        );

        document.setFilePath(
                targetPath
                        .toAbsolutePath()
                        .toString()
        );

        document.setContentType(
                file.getContentType()
        );

        document.setFileSize(
                file.getSize()
        );

        document.setUploadedAt(
                LocalDateTime.now()
        );

        // -----------------------------------------------------
        // SAVE DATABASE
        // -----------------------------------------------------

        return loanDocumentRepository.save(
                document
        );
    }

    // =========================================================
    // UPLOAD MULTIPLE DOCUMENTS
    // =========================================================

    public List<LoanDocument> uploadDocuments(
            Long loanId,
            List<String> documentTypes,
            List<MultipartFile> files
    ) throws IOException {

        // -----------------------------------------------------
        // VALIDATE
        // -----------------------------------------------------

        if (loanId == null) {

            throw new IllegalArgumentException(
                    "Loan ID is required"
            );
        }

        if (documentTypes == null ||
                files == null ||
                documentTypes.isEmpty() ||
                files.isEmpty()) {

            throw new IllegalArgumentException(
                    "Documents are required"
            );
        }

        if (documentTypes.size() != files.size()) {

            throw new IllegalArgumentException(
                    "Document types and files count do not match"
            );
        }

        // -----------------------------------------------------
        // RESULT
        // -----------------------------------------------------

        List<LoanDocument> uploadedDocuments =
                new ArrayList<>();

        // -----------------------------------------------------
        // UPLOAD EACH FILE
        // -----------------------------------------------------

        for (int i = 0;
             i < files.size();
             i++) {

            MultipartFile file =
                    files.get(i);

            String documentType =
                    documentTypes.get(i);

            if (file == null ||
                    file.isEmpty()) {

                throw new IllegalArgumentException(
                        "One of the uploaded files is empty"
                );
            }

            LoanDocument document =
                    uploadDocument(
                            loanId,
                            documentType,
                            file
                    );

            uploadedDocuments.add(
                    document
            );
        }

        return uploadedDocuments;
    }

    // =========================================================
    // GET ALL DOCUMENTS
    // =========================================================

    public List<LoanDocument> getLoanDocuments(
            Long loanId
    ) {

        if (loanId == null) {

            throw new IllegalArgumentException(
                    "Loan ID is required"
            );
        }

        if (!loanRepository.existsById(
                loanId
        )) {

            throw new IllegalArgumentException(
                    "Loan not found with ID: "
                            + loanId
            );
        }

        return loanDocumentRepository
                .findByLoanIdOrderByUploadedAtDesc(
                        loanId
                );
    }

    // =========================================================
    // GET DOCUMENT BY ID
    // =========================================================

    public LoanDocument getDocumentById(
            Long documentId
    ) {

        if (documentId == null) {

            throw new IllegalArgumentException(
                    "Document ID is required"
            );
        }

        return loanDocumentRepository
                .findById(documentId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Document not found with ID: "
                                        + documentId
                        )
                );
    }

    // =========================================================
    // LOAD FILE
    // =========================================================

    public Resource loadFile(
            Long documentId
    ) throws MalformedURLException {

        LoanDocument document =
                getDocumentById(
                        documentId
                );

        Path path =
                Paths.get(
                        document.getFilePath()
                );

        if (!Files.exists(path)) {

            throw new IllegalArgumentException(
                    "Document file not found"
            );
        }

        Resource resource =
                new UrlResource(
                        path.toUri()
                );

        if (!resource.exists() ||
                !resource.isReadable()) {

            throw new IllegalArgumentException(
                    "Document file cannot be read"
            );
        }

        return resource;
    }

    // =========================================================
    // DELETE DOCUMENT
    // =========================================================

    public void deleteDocument(
            Long documentId
    ) throws IOException {

        LoanDocument document =
                getDocumentById(
                        documentId
                );

        // -----------------------------------------------------
        // DELETE PHYSICAL FILE
        // -----------------------------------------------------

        if (document.getFilePath() != null &&
                !document.getFilePath().isBlank()) {

            Path path =
                    Paths.get(
                            document.getFilePath()
                    );

            Files.deleteIfExists(
                    path
            );
        }

        // -----------------------------------------------------
        // DELETE DATABASE RECORD
        // -----------------------------------------------------

        loanDocumentRepository.delete(
                document
        );
    }

    // =========================================================
    // NORMALIZE DOCUMENT TYPE
    // =========================================================

    private String normalizeDocumentType(
            String documentType
    ) {

        if (documentType == null ||
                documentType.isBlank()) {

            throw new IllegalArgumentException(
                    "Document type is required"
            );
        }

        String normalized =
                documentType
                        .trim()
                        .toUpperCase();

        if (!ALLOWED_DOCUMENT_TYPES
                .contains(normalized)) {

            throw new IllegalArgumentException(
                    "Invalid document type: "
                            + documentType
            );
        }

        return normalized;
    }

    // =========================================================
    // VALIDATE FILE
    // =========================================================

    private void validateFile(
            MultipartFile file
    ) {

        if (file == null ||
                file.isEmpty()) {

            throw new IllegalArgumentException(
                    "File is required"
            );
        }

        // -----------------------------------------------------
        // FILE SIZE
        // -----------------------------------------------------

        if (file.getSize() >
                MAX_FILE_SIZE) {

            throw new IllegalArgumentException(
                    "File size must not exceed 5 MB"
            );
        }

        // -----------------------------------------------------
        // CONTENT TYPE
        // -----------------------------------------------------

        String contentType =
                file.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES
                        .contains(
                                contentType
                        )) {

            throw new IllegalArgumentException(
                    "Only PDF, JPG, JPEG and PNG files are allowed"
            );
        }
    }

    // =========================================================
    // FILE EXTENSION
    // =========================================================

    private String getFileExtension(
            String fileName
    ) {

        if (fileName == null) {
            return "";
        }

        int index =
                fileName.lastIndexOf(".");

        if (index == -1) {
            return "";
        }

        return fileName.substring(
                index
        ).toLowerCase();
    }
}