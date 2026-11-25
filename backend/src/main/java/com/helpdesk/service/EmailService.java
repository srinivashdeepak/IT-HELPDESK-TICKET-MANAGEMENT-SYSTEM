package com.helpdesk.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:notifications@company.com}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String body) {
        if (!mailEnabled || mailSender == null) {
            logger.info("[SMTP MOCK/LOG] Email to: {} | Subject: {} | Message: {}", to, subject, body.replace("\n", " "));
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Email notification successfully dispatched to {}", to);
        } catch (Exception e) {
            logger.warn("Failed to dispatch SMTP email to {}: {}. Logged notification instead.", to, e.getMessage());
        }
    }
}
