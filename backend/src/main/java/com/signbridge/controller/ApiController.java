package com.signbridge.controller;

import com.signbridge.model.Message;
import com.signbridge.repository.MessageRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final MessageRepository messages;
    public ApiController(MessageRepository messages) { this.messages = messages; }

    private static final List<Map<String, String>> PHRASES = List.of(
        Map.of("key","HELP","text","I need help","emoji","🆘"),
        Map.of("key","WATER","text","I need water, please","emoji","💧"),
        Map.of("key","DOCTOR","text","I need to speak to a doctor","emoji","🩺"),
        Map.of("key","FOOD","text","I need food, please","emoji","🍎"),
        Map.of("key","EMERGENCY","text","This is an emergency. Please help me now.","emoji","🚨"),
        Map.of("key","BATHROOM","text","Where is the bathroom?","emoji","🚻"),
        Map.of("key","PAIN","text","I am in pain and need assistance","emoji","❤️‍🩹"),
        Map.of("key","THANKS","text","Thank you for helping me","emoji","💙")
    );

    @GetMapping("/health")
    public Map<String, String> health() { return Map.of("status", "ok", "app", "SignBridge"); }

    @GetMapping("/phrases")
    public List<Map<String, String>> phrases() { return PHRASES; }

    @GetMapping("/messages")
    public List<Message> messages() { return messages.findTop100ByOrderByCreatedAtAsc(); }

    @PostMapping("/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public Message send(@Valid @RequestBody MessageRequest request) {
        String sender = request.sender() == null || request.sender().isBlank() ? "visitor" : request.sender().trim();
        if (!List.of("visitor", "staff").contains(sender)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sender must be visitor or staff");
        return messages.save(new Message(request.text().trim(), sender));
    }

    public record MessageRequest(@NotBlank @Size(max=2000) String text, @Size(max=20) String sender) {}
}
