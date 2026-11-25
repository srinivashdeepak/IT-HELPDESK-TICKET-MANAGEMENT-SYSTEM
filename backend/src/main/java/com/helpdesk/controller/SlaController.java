package com.helpdesk.controller;

import com.helpdesk.dto.ApiResponse;
import com.helpdesk.dto.SlaRuleDto;
import com.helpdesk.service.SlaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sla")
public class SlaController {

    @Autowired
    private SlaService slaService;

    @GetMapping({"", "/rules"})
    public ResponseEntity<ApiResponse<List<SlaRuleDto>>> getSlaRules() {
        return ResponseEntity.ok(ApiResponse.success(slaService.getAllRules()));
    }

    @PutMapping("/rules/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<SlaRuleDto>> updateSlaRule(
            @PathVariable Long id,
            @Valid @RequestBody SlaRuleDto dto) {
        SlaRuleDto updated = slaService.updateRule(id, dto);
        return ResponseEntity.ok(ApiResponse.success("SLA rule updated successfully", updated));
    }

    @PostMapping("/check-breaches")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> triggerSlaCheck() {
        slaService.checkAndEscalateBreachedTickets();
        return ResponseEntity.ok(ApiResponse.success("SLA breach scan completed", null));
    }
}
