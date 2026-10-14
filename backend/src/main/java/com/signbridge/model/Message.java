package com.signbridge.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false, length=2000)
    private String text;
    @Column(nullable=false)
    private String sender;
    @Column(nullable=false)
    private Instant createdAt = Instant.now();

    protected Message() {}
    public Message(String text, String sender) { this.text = text; this.sender = sender; this.createdAt = Instant.now(); }
    public Long getId() { return id; }
    public String getText() { return text; }
    public String getSender() { return sender; }
    public Instant getCreatedAt() { return createdAt; }
}
