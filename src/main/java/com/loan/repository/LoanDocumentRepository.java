package com.loan.repository;

import com.loan.entity.LoanDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanDocumentRepository
        extends JpaRepository<LoanDocument, Long> {

    // =========================================================
    // GET ALL DOCUMENTS OF A LOAN
    // =========================================================

    List<LoanDocument> findByLoanIdOrderByUploadedAtDesc(
            Long loanId
    );
}