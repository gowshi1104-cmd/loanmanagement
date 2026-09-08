package com.loan.config;

import com.loan.security.JwtFilter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

        private final JwtFilter jwtFilter;
        private final AuthenticationProvider authenticationProvider;

        /*
         * FRONTEND_URL is read from application.properties
         * which in Railway comes from the FRONTEND_URL environment variable.
         */
        @Value("${frontend.url}")
        private String frontendUrl;

        public SecurityConfig(
                        JwtFilter jwtFilter,
                        AuthenticationProvider authenticationProvider) {
                this.jwtFilter = jwtFilter;
                this.authenticationProvider = authenticationProvider;
        }

        // =========================================================
        // SECURITY FILTER CHAIN
        // =========================================================

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http

                                // =================================================
                                // CSRF
                                // =================================================

                                .csrf(csrf -> csrf.disable())

                                // =================================================
                                // CORS
                                // =================================================

                                .cors(cors -> cors.configurationSource(
                                                corsConfigurationSource()))

                                // =================================================
                                // EXCEPTION HANDLING
                                // =================================================

                                .exceptionHandling(exception -> exception

                                                // Unauthenticated -> 401
                                                .authenticationEntryPoint(
                                                                authenticationEntryPoint())

                                                // Authenticated but forbidden -> 403
                                                .accessDeniedHandler(
                                                                accessDeniedHandler()))

                                // =================================================
                                // AUTHORIZATION
                                // =================================================

                                .authorizeHttpRequests(auth -> auth

                                                // =================================================
                                                // CORS PREFLIGHT
                                                // =================================================

                                                .requestMatchers(
                                                                HttpMethod.OPTIONS,
                                                                "/**")
                                                .permitAll()

                                                // =================================================
                                                // LOGIN / AUTH
                                                // =================================================

                                                .requestMatchers("/api/auth/login").permitAll()
                                                .requestMatchers("/api/auth/refresh").permitAll()
                                                .requestMatchers("/api/auth/logout").permitAll()

                                                // =================================================
                                                // ADMIN DASHBOARD
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/dashboard",
                                                                "/api/dashboard/**")
                                                .hasAnyAuthority(
                                                                "ROLE_ADMIN",
                                                                "VIEW_DASHBOARD")

                                                // =================================================
                                                // MANAGER DASHBOARD
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/manager/dashboard",
                                                                "/api/manager/dashboard/**")
                                                .hasAuthority(
                                                                "VIEW_MANAGER_DASHBOARD")

                                                // =================================================
                                                // CUSTOMER DASHBOARD
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/customer/dashboard",
                                                                "/api/customer/dashboard/**")
                                                .hasAuthority(
                                                                "VIEW_CUSTOMER_DASHBOARD")

                                                // =================================================
                                                // CUSTOMER LOANS
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/customer/loans",
                                                                "/api/customer/loans/**")
                                                .hasAuthority(
                                                                "VIEW_MY_LOANS")

                                                // =================================================
                                                // CUSTOMER EMI
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/customer/emi-schedule",
                                                                "/api/customer/emi-schedule/**")
                                                .hasAuthority(
                                                                "VIEW_EMI_SCHEDULE")

                                                // =================================================
                                                // CUSTOMER PAYMENT HISTORY
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/customer/payment-history",
                                                                "/api/customer/payment-history/**")
                                                .hasAuthority(
                                                                "VIEW_MY_PAYMENT_HISTORY")

                                                // =================================================
                                                // OTHER CUSTOMER APIs
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/customer/**")
                                                .authenticated()

                                                // =================================================
                                                // STAFF DASHBOARD
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/staff/dashboard",
                                                                "/api/staff/dashboard/**")
                                                .authenticated()

                                                // =================================================
                                                // LOANS
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/loans/**")
                                                .authenticated()

                                                // =================================================
                                                // PAYMENT HISTORY
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/payment-history/**")
                                                .authenticated()

                                                // =================================================
                                                // PAYMENTS
                                                // IMPORTANT:
                                                // No longer public
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/payments/**")
                                                .authenticated()

                                                // =================================================
                                                // MEMBERS
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/members/**")
                                                .authenticated()

                                                // =================================================
                                                // MEMBER HISTORY
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/member-history/**")
                                                .authenticated()

                                                // =================================================
                                                // LOAN DOCUMENTS
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/loan-documents/**")
                                                .authenticated()

                                                // =================================================
                                                // GROUPS
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/groups/**")
                                                .authenticated()

                                                // =================================================
                                                // USERS
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/users/**")
                                                .authenticated()

                                                // =================================================
                                                // ROLES
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/roles/**")
                                                .authenticated()

                                                // =================================================
                                                // NOTIFICATIONS
                                                // =================================================

                                                .requestMatchers(
                                                                "/api/notifications/**")
                                                .authenticated()

                                                // =================================================
                                                // EVERYTHING ELSE
                                                // =================================================

                                                .anyRequest().authenticated())

                                // =================================================
                                // SESSION
                                // =================================================

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                // =================================================
                                // AUTHENTICATION PROVIDER
                                // =================================================

                                .authenticationProvider(
                                                authenticationProvider)

                                // =================================================
                                // JWT FILTER
                                // =================================================

                                .addFilterBefore(
                                                jwtFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // =========================================================
        // 401 HANDLER
        // =========================================================

        @Bean
        public AuthenticationEntryPoint authenticationEntryPoint() {

                return (request, response, authException) -> {

                        response.setStatus(
                                        HttpStatus.UNAUTHORIZED.value());

                        response.setContentType(
                                        "application/json");

                        response.getWriter().write(
                                        """
                                                        {
                                                            "status": 401,
                                                            "error": "Unauthorized",
                                                            "message": "Authentication is required"
                                                        }
                                                        """);
                };
        }

        // =========================================================
        // 403 HANDLER
        // =========================================================

        @Bean
        public AccessDeniedHandler accessDeniedHandler() {

                return (request, response, accessDeniedException) -> {

                        response.setStatus(
                                        HttpStatus.FORBIDDEN.value());

                        response.setContentType(
                                        "application/json");

                        response.getWriter().write(
                                        """
                                                        {
                                                            "status": 403,
                                                            "error": "Forbidden",
                                                            "message": "You do not have permission to access this resource"
                                                        }
                                                        """);
                };
        }

        // =========================================================
        // CORS CONFIGURATION
        // =========================================================

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                // =========================================================
                // FRONTEND ORIGINS
                // =========================================================
                //
                // Local development:
                // http://localhost:5173
                //
                // Production:
                // Value comes from FRONTEND_URL environment variable
                //
                // =========================================================

                configuration.setAllowedOriginPatterns(
                                List.of(
                                                "http://localhost:5173",
                                                frontendUrl));

                // =========================================================
                // METHODS
                // =========================================================

                configuration.setAllowedMethods(
                                List.of(
                                                "GET",
                                                "POST",
                                                "PUT",
                                                "DELETE",
                                                "PATCH",
                                                "OPTIONS"));

                // =========================================================
                // HEADERS
                // =========================================================

                configuration.setAllowedHeaders(
                                List.of(
                                                "Authorization",
                                                "Content-Type",
                                                "Accept",
                                                "Origin",
                                                "X-Requested-With"));

                // =========================================================
                // EXPOSED HEADERS
                // =========================================================

                configuration.setExposedHeaders(
                                List.of(
                                                "Authorization"));

                // =========================================================
                // CREDENTIALS
                // =========================================================

                configuration.setAllowCredentials(true);

                // =========================================================
                // REGISTER
                // =========================================================

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }
}