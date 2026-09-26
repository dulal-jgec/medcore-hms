package com.medcore.common.security.config;

import com.medcore.common.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationProvider;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> {})

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                "/api/v1/auth/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/actuator/health",
                                "/api/v1/public/**"
                        )
                        .permitAll()

                        .anyRequest()
                        .authenticated()
                )
                
                .exceptionHandling(exception -> exception
                	    .authenticationEntryPoint(
                	        (request, response, authException) -> {
                	            response.setStatus(
                	                jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED
                	            );
                	            response.setContentType("application/json");
                	            response.getWriter().write(
                	                "{\"success\":false,\"message\":\"Unauthorized\"}"
                	            );
                	        }
                	    )
                	)

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authenticationProvider(
                        authenticationProvider
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .httpBasic(httpBasic ->
                        httpBasic.disable()
                )
                

                .formLogin(form ->
                        form.disable()
                )
                
                
                ;
        

        return http.build();
    }
}