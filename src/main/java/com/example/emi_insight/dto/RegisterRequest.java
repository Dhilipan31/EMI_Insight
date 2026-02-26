package com.example.emi_insight.dto;

public record RegisterRequest(
    String username,
    String email,
    String password
) {
}
