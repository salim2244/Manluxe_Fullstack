package com.example.FirstCopy.ServiceImpl;
import com.example.FirstCopy.dto.PaymentFailedRequest;
import com.example.FirstCopy.dto.VerifyPaymentRequest;
import com.example.FirstCopy.dto.PaymentRequest;
import com.example.FirstCopy.dto.PaymentResponse;
import com.example.FirstCopy.entity.*;
import com.example.FirstCopy.exception.ResourceNotFoundException;
import com.example.FirstCopy.repository.CartRepository;
import com.example.FirstCopy.repository.OrderRepository;
import com.example.FirstCopy.repository.PaymentRepository;
import com.example.FirstCopy.repository.ProductSizeRepository;
import com.example.FirstCopy.service.PaymentService;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final RazorpayClient razorpayClient;

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    private final ProductSizeRepository productSizeRepository;
    private final CartRepository cartRepository;

    @Value("${razorpay.key.secret}")
    private String razorpaySecret;


    @Override
    @Transactional
    public PaymentResponse verifyPayment(VerifyPaymentRequest request) throws Exception {


        Payment payment = paymentRepository
                .findByOrderId(request.getRazorpayOrderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found"));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new RuntimeException("Payment already verified");
        }


        JSONObject options = new JSONObject();

        options.put(
                "razorpay_order_id",
                request.getRazorpayOrderId()
        );

        options.put(
                "razorpay_payment_id",
                request.getRazorpayPaymentId()
        );

        options.put(
                "razorpay_signature",
                request.getRazorpaySignature()
        );



        boolean valid = Utils.verifyPaymentSignature(
                options,
                razorpaySecret
        );


        if (!valid) {
            throw new RuntimeException("Invalid Payment Signature");
        }



        Order order = payment.getOrder();





        // Reduce stock after successful payment

        for(OrderItem item : order.getItems()) {


            ProductSize productSize =
                    productSizeRepository
                            .findByProductAndSize(
                                    item.getProduct(),
                                    item.getSize()
                            )
                            .orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Size not found"
                                    ));



            if(productSize.getStock() < item.getQuantity()) {

                throw new RuntimeException(
                        "Insufficient stock for "
                                + item.getProduct().getName()
                                + " size "
                                + item.getSize()
                );
            }



            productSize.setStock(
                    productSize.getStock()
                            - item.getQuantity()
            );


            productSizeRepository.save(productSize);
        }



        // Clear user cart after successful payment

        Cart cart = cartRepository
                .findByUser(order.getUser())
                .orElse(null);


        if(cart != null) {

            cart.getItems().clear();

            cartRepository.save(cart);
        }



        payment.setPaymentId(
                request.getRazorpayPaymentId()
        );

        payment.setStatus(
                PaymentStatus.SUCCESS
        );


        order.setStatus(
                OrderStatus.CONFIRMED
        );



        orderRepository.save(order);

        paymentRepository.save(payment);



        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .razorpayOrderId(payment.getOrderId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .build();
    }

    @Override
    @Transactional
    public void paymentFailed(PaymentFailedRequest request) {

        Payment payment = paymentRepository
                .findByOrderId(request.getRazorpayOrderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found"));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new RuntimeException("Payment already completed.");
        }

        payment.setStatus(PaymentStatus.FAILED);

        Order order = payment.getOrder();

        order.setStatus(OrderStatus.PAYMENT_FAILED);

        paymentRepository.save(payment);

        orderRepository.save(order);
    }

    @Override
    public PaymentResponse createPayment(PaymentRequest request) throws Exception {

        com.example.FirstCopy.entity.Order customerOrder =
                orderRepository.findById(request.getOrderId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Order not found"));

        JSONObject options = new JSONObject();

        options.put("amount", customerOrder.getTotalPrice() * 100);
        options.put("currency", "INR");
        options.put("receipt", "order_" + customerOrder.getId());

        com.razorpay.Order razorpayOrder =
                razorpayClient.orders.create(options);

        Payment payment = Payment.builder()
                .paymentId(null)
                .orderId(razorpayOrder.get("id"))
                .amount(customerOrder.getTotalPrice())
                .status(PaymentStatus.PENDING)
                .order(customerOrder)
                .build();

        payment = paymentRepository.save(payment);

        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .razorpayOrderId(razorpayOrder.get("id"))
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .build();
    }
}