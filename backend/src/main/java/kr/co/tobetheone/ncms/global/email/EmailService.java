package kr.co.tobetheone.ncms.global.email;

import kr.co.tobetheone.ncms.order.domain.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private static final String TARGET_EMAIL = "logcom2@naver.com";

    public void sendApprovalNotification(Order order) {
        String orderNo = order != null && order.getOrderNo() != null ? order.getOrderNo() : "-";
        String recipientName = order != null && order.getRecipientName() != null ? order.getRecipientName() : "주문자";
        String companyName = (order != null && order.getCompany() != null && order.getCompany().getName() != null) 
                ? order.getCompany().getName() 
                : "고객사";

        String subject = String.format("[%s] 주문이 승인되었습니다.", companyName);
        String body = String.format(
                "안녕하세요, 로그컴 관리자님.\n\n" +
                "아래 주문이 승인 완료되었습니다.\n\n" +
                "- 고객사: %s\n" +
                "- 주문번호: %s\n" +
                "- 주문자: %s\n" +
                "- 승인 상태: APPROVED (검수 승인)\n\n" +
                "감사합니다.",
                companyName, orderNo, recipientName
        );

        log.info("[EMAIL NOTIFICATION] Sending approval mail for OrderNo: {} to {}", orderNo, TARGET_EMAIL);

        if (mailSender == null) {
            log.warn("[EMAIL NOTIFICATION] JavaMailSender is not configured. Mail notification simulated for OrderNo: {}", orderNo);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(TARGET_EMAIL);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("[EMAIL NOTIFICATION] Approval email successfully sent to {} for OrderNo: {}", TARGET_EMAIL, orderNo);
        } catch (Exception e) {
            log.error("[EMAIL NOTIFICATION] Failed to send approval email for OrderNo: {}. Error: {}", orderNo, e.getMessage(), e);
        }
    }

    public void sendCheilOrderNotification(Order order, String targetEmail) {
        if (targetEmail == null || targetEmail.isBlank()) {
            log.warn("[EMAIL NOTIFICATION] cheil_admin email is missing. Skipping email notification.");
            return;
        }

        String orderNo = order != null && order.getOrderNo() != null ? order.getOrderNo() : "-";
        String recipientName = order != null && order.getRecipientName() != null ? order.getRecipientName() : "주문자";
        String memberName = (order != null && order.getMember() != null && order.getMember().getName() != null)
                ? order.getMember().getName()
                : recipientName;

        String subject = String.format("[제일엔지니어링] 신규 주문이 접수되었습니다. (주문번호: %s)", orderNo);
        String body = String.format(
                "안녕하세요, 제일엔지니어링 기업 관리자님.\n\n" +
                "소속 임직원(%s)의 신규 명함 주문이 완결/접수되었습니다.\n\n" +
                "- 고객사: 제일엔지니어링\n" +
                "- 주문번호: %s\n" +
                "- 주문자/수령인: %s\n" +
                "- 진행 상태: PENDING (검수 대기)\n\n" +
                "감사합니다.",
                memberName, orderNo, recipientName
        );

        log.info("[EMAIL NOTIFICATION] Sending Cheil order completion mail for OrderNo: {} to cheil_admin ({})", orderNo, targetEmail);

        if (mailSender == null) {
            log.warn("[EMAIL NOTIFICATION] JavaMailSender is not configured. Mail notification simulated for OrderNo: {} to {}", orderNo, targetEmail);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(targetEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("[EMAIL NOTIFICATION] Cheil order completion email successfully sent to {} for OrderNo: {}", targetEmail, orderNo);
        } catch (Exception e) {
            log.error("[EMAIL NOTIFICATION] Failed to send Cheil order email for OrderNo: {}. Error: {}", orderNo, e.getMessage(), e);
        }
    }
}
