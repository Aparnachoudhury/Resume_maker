package com.jobmatch.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ResumeParserService {

    private static final String[] COMMON_SKILLS = {
        "Java", "Python", "JavaScript", "TypeScript", "C++", "C#", ".NET",
        "React", "Angular", "Vue.js", "Node.js", "Express",
        "Spring Boot", "Django", "Flask", "Laravel", "ASP.NET",
        "MySQL", "PostgreSQL", "MongoDB", "Redis", "Cassandra",
        "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes",
        "Git", "Jenkins", "CI/CD", "REST API", "GraphQL",
        "HTML", "CSS", "SASS", "Bootstrap", "Material Design",
        "SQL", "Microservices", "Design Patterns", "SOLID", "OOP"
    };

    public Map<String, Object> parseResume(MultipartFile file) throws IOException {
        Map<String, Object> result = new HashMap<>();
        
        try (InputStream inputStream = file.getInputStream()) {
            PDDocument document = Loader.loadPDF(inputStream.readAllBytes());
            
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            
            document.close();
            
            // Extract email
            String email = extractEmail(text);
            
            // Extract phone
            String phone = extractPhone(text);
            
            // Extract skills
            List<String> skills = extractSkills(text);
            
            result.put("success", true);
            result.put("email", email);
            result.put("phone", phone);
            result.put("skills", skills);
            result.put("rawText", text.substring(0, Math.min(500, text.length())));
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }

    private String extractEmail(String text) {
        Pattern pattern = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group() : "";
    }

    private String extractPhone(String text) {
        Pattern pattern = Pattern.compile("\\+?[1-9]\\d{1,14}");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group() : "";
    }

    private List<String> extractSkills(String text) {
        List<String> foundSkills = new ArrayList<>();
        String lowerText = text.toLowerCase();
        
        for (String skill : COMMON_SKILLS) {
            if (lowerText.contains(skill.toLowerCase())) {
                foundSkills.add(skill);
            }
        }
        
        return foundSkills;
    }
}