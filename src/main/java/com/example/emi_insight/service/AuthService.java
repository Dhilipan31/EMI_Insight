package com.example.emi_insight.service;

import com.example.emi_insight.dto.AuthResponse;
import com.example.emi_insight.dto.LoginRequest;
import com.example.emi_insight.dto.RegisterRequest;
import com.example.emi_insight.entity.UserEntity;
import com.example.emi_insight.repository.UserRepository;
import com.example.emi_insight.util.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService customUserDetailsService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager,
        JwtUtil jwtUtil,
        CustomUserDetailsService customUserDetailsService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.customUserDetailsService = customUserDetailsService;
    }

    public AuthResponse register(RegisterRequest request) {
        validateRegisterRequest(request);

        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        UserEntity user = UserEntity.builder()
            .userId(UUID.randomUUID().toString())
            .username(request.username().trim())
            .email(request.email().trim().toLowerCase())
            .password(passwordEncoder.encode(request.password()))
            .build();

        UserEntity savedUser = userRepository.save(user);

        return AuthResponse.builder()
                .userId(savedUser.getUserId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        validateLoginRequest(request);

        try {
                authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
            );
        } catch (BadCredentialsException ex) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(request.email());
        UserEntity user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    private void validateRegisterRequest(RegisterRequest request) {
        if (request == null || isBlank(request.username()) || isBlank(request.email()) || isBlank(request.password())) {
            throw new IllegalArgumentException("username, email and password are required");
        }
    }

    private void validateLoginRequest(LoginRequest request) {
        if (request == null || isBlank(request.email()) || isBlank(request.password())) {
            throw new IllegalArgumentException("email and password are required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
