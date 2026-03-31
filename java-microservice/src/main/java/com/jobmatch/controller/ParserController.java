package com.jobmatch.controller;

import com.jobmatch.service.ResumeParserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ParserController {

    @Autowired
    private ResumeParserService resumeParserService;

    @PostMapping("/parse-resume")
    public ResponseEntity<?> parseResume(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            Map<String, Object> parsedData = resumeParserService.parseResume(file);
            return ResponseEntity.ok(parsedData);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error parsing resume: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        return ResponseEntity.ok(response);
    }
}