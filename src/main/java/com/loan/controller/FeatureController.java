package com.loan.controller;

import com.loan.entity.Feature;
import com.loan.entity.RoleFeature;
import com.loan.service.FeatureService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/features")
@CrossOrigin(origins = "http://localhost:5173")
public class FeatureController {

    private final FeatureService featureService;

    public FeatureController(
            FeatureService featureService
    ) {
        this.featureService = featureService;
    }

    // =========================================================
    // GET ALL FEATURES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Feature>> getAllFeatures() {

        return ResponseEntity.ok(
                featureService.getAllFeatures()
        );
    }

    // =========================================================
    // GET FEATURE BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Feature> getFeatureById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                featureService.getFeatureById(id)
        );
    }

    // =========================================================
    // CREATE FEATURE
    // =========================================================

    @PostMapping
    public ResponseEntity<Feature> createFeature(
            @RequestBody Feature feature
    ) {

        return ResponseEntity.ok(
                featureService.createFeature(feature)
        );
    }

    // =========================================================
    // UPDATE FEATURE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<Feature> updateFeature(
            @PathVariable Long id,
            @RequestBody Feature feature
    ) {

        return ResponseEntity.ok(
                featureService.updateFeature(
                        id,
                        feature
                )
        );
    }

    // =========================================================
    // DELETE FEATURE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeature(
            @PathVariable Long id
    ) {

        featureService.deleteFeature(id);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Feature deleted successfully"
                )
        );
    }

    // =========================================================
    // UPDATE GLOBAL FEATURE STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<Feature> updateFeatureStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled
    ) {

        return ResponseEntity.ok(
                featureService.updateFeatureStatus(
                        id,
                        enabled
                )
        );
    }

    // =========================================================
    // GET ROLE FEATURES
    // =========================================================

    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<RoleFeature>> getRoleFeatures(
            @PathVariable Long roleId
    ) {

        return ResponseEntity.ok(
                featureService.getRoleFeatures(
                        roleId
                )
        );
    }

    // =========================================================
    // UPDATE ROLE FEATURE
    // =========================================================

    @PatchMapping("/role/{roleId}/feature/{featureId}")
    public ResponseEntity<RoleFeature> updateRoleFeature(
            @PathVariable Long roleId,
            @PathVariable Long featureId,
            @RequestParam boolean enabled
    ) {

        return ResponseEntity.ok(
                featureService.updateRoleFeature(
                        roleId,
                        featureId,
                        enabled
                )
        );
    }

    // =========================================================
    // GET CURRENT USER FEATURES
    // =========================================================

    @GetMapping("/my-features")
    public ResponseEntity<List<Feature>> getCurrentUserFeatures() {

        return ResponseEntity.ok(
                featureService.getCurrentUserFeatures()
        );
    }

    // =========================================================
    // CHECK FEATURE ACCESS
    // =========================================================

    @GetMapping("/check/{featureKey}")
    public ResponseEntity<Boolean> checkFeatureAccess(
            @PathVariable String featureKey
    ) {

        return ResponseEntity.ok(
                featureService
                        .isFeatureEnabledForCurrentUser(
                                featureKey
                        )
        );
    }
}