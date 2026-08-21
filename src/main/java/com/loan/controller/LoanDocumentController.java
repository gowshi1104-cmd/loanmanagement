package com.loan.controller;

import com.loan.entity.LoanDocument;
import com.loan.service.LoanDocumentService;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.util.List;

@RestController
@RequestMapping("/api/loan-documents")
@CrossOrigin(origins = "http://localhost:5173")
public class LoanDocumentController {

    // =========================================================
    // SERVICE
    // =========================================================

    private final LoanDocumentService loanDocumentService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public LoanDocumentController(
            LoanDocumentService loanDocumentService
    ) {

        this.loanDocumentService =
                loanDocumentService;
    }

    // =========================================================
    // SINGLE UPLOAD
    //
    // POST /api/loan-documents/upload/{loanId}
    // =========================================================

    @PostMapping("/upload/{loanId}")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long loanId,
            @RequestParam("documentType")
            String documentType,
            @RequestParam("file")
            MultipartFile file
    ) {

        try {

            LoanDocument document =
                    loanDocumentService.uploadDocument(
                            loanId,
                            documentType,
                            file
                    );

            return ResponseEntity
                    .status(201)
                    .body(document);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to upload document"
                    );
        }
    }

    // =========================================================
    // BATCH UPLOAD
    //
    // POST /api/loan-documents/upload-batch/{loanId}
    // =========================================================

    @PostMapping("/upload-batch/{loanId}")
    public ResponseEntity<?> uploadDocuments(
            @PathVariable Long loanId,

            @RequestParam("documentType")
            List<String> documentTypes,

            @RequestParam("file")
            List<MultipartFile> files
    ) {

        try {

            List<LoanDocument> documents =
                    loanDocumentService.uploadDocuments(
                            loanId,
                            documentTypes,
                            files
                    );

            return ResponseEntity
                    .status(201)
                    .body(documents);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to upload documents"
                    );
        }
    }

    // =========================================================
    // GET ALL DOCUMENTS OF LOAN
    //
    // GET /api/loan-documents/loan/{loanId}
    // =========================================================

    @GetMapping("/loan/{loanId}")
    public ResponseEntity<?> getLoanDocuments(
            @PathVariable Long loanId
    ) {

        try {

            List<LoanDocument> documents =
                    loanDocumentService.getLoanDocuments(
                            loanId
                    );

            return ResponseEntity.ok(
                    documents
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(404)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to fetch loan documents"
                    );
        }
    }

    // =========================================================
    // GET DOCUMENT BY ID
    //
    // GET /api/loan-documents/{documentId}
    // =========================================================

    @GetMapping("/{documentId}")
    public ResponseEntity<?> getDocument(
            @PathVariable Long documentId
    ) {

        try {

            LoanDocument document =
                    loanDocumentService.getDocumentById(
                            documentId
                    );

            return ResponseEntity.ok(
                    document
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(404)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to fetch document"
                    );
        }
    }

    // =========================================================
    // DOWNLOAD / VIEW DOCUMENT
    //
    // GET /api/loan-documents/download/{documentId}
    // =========================================================

    @GetMapping("/download/{documentId}")
    public ResponseEntity<?> downloadDocument(
            @PathVariable Long documentId
    ) {

        try {

            LoanDocument document =
                    loanDocumentService.getDocumentById(
                            documentId
                    );

            Resource resource =
                    loanDocumentService.loadFile(
                            documentId
                    );

            String contentType =
                    document.getContentType();

            if (contentType == null ||
                    contentType.isBlank()) {

                contentType =
                        MediaType.APPLICATION_OCTET_STREAM
                                .toString();
            }

            MediaType mediaType;

            try {

                mediaType =
                        MediaType.parseMediaType(
                                contentType
                        );

            } catch (Exception e) {

                mediaType =
                        MediaType.APPLICATION_OCTET_STREAM;
            }

            return ResponseEntity
                    .ok()
                    .contentType(
                            mediaType
                    )
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            ContentDisposition
                                    .inline()
                                    .filename(
                                            document
                                                    .getOriginalFileName()
                                    )
                                    .build()
                                    .toString()
                    )
                    .body(resource);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(404)
                    .body(e.getMessage());

        } catch (MalformedURLException e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Invalid file path"
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to download document"
                    );
        }
    }

    // =========================================================
    // DELETE DOCUMENT
    //
    // DELETE /api/loan-documents/{documentId}
    // =========================================================

    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long documentId
    ) {

        try {

            loanDocumentService.deleteDocument(
                    documentId
            );

            return ResponseEntity.ok(
                    "Document deleted successfully"
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(404)
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to delete document"
                    );
        }
    }
}