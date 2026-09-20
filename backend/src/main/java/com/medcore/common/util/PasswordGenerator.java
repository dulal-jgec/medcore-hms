package com.medcore.common.util;

import java.security.SecureRandom;

public final class PasswordGenerator {

    private static final String CHARACTERS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            + "abcdefghijklmnopqrstuvwxyz"
            + "0123456789"
            + "@#$%";

    private static final int PASSWORD_LENGTH = 10;

    private static final SecureRandom RANDOM =
            new SecureRandom();

    private PasswordGenerator() {
        
    }

    public static String generate() {

        StringBuilder password =
                new StringBuilder(PASSWORD_LENGTH);

        for (int i = 0; i < PASSWORD_LENGTH; i++) {

            int index =
                    RANDOM.nextInt(CHARACTERS.length());

            password.append(
                    CHARACTERS.charAt(index)
            );
        }

        return password.toString();
    }
}