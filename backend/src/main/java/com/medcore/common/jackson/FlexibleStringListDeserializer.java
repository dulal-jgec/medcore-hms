package com.medcore.common.jackson;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Accepts ANY of:
 *   - null           → null
 *   - []             → []
 *   - ["a","b"]      → ["a","b"]
 *   - ""             → []
 *   - "a, b"         → ["a","b"]
 *   - "single"       → ["single"]
 *
 * Never throws on shape mismatch — that's the whole point.
 */
public class FlexibleStringListDeserializer extends JsonDeserializer<List<String>> {

    @Override
    public List<String> deserialize(JsonParser p, DeserializationContext ctxt)
            throws IOException {

        JsonNode node = p.getCodec().readTree(p);

        if (node == null || node.isNull()) return null;

        // Array form → clean it up
        if (node.isArray()) {
            List<String> list = new ArrayList<>();
            node.forEach(n -> {
                if (n != null && !n.isNull()) {
                    String val = n.asText().trim();
                    if (!val.isEmpty()) list.add(val);
                }
            });
            return list;
        }

        // String form → split by comma
        if (node.isTextual()) {
            String text = node.asText().trim();
            if (text.isEmpty()) return new ArrayList<>();
            return Arrays.stream(text.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }

        // Anything else (number, boolean…) → stringify safely
        String asText = node.asText("").trim();
        return asText.isEmpty()
                ? new ArrayList<>()
                : List.of(asText);
    }
}