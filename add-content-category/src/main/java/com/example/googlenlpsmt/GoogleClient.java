package com.example.googlenlpsmt;

import okhttp3.*;
import com.google.gson.*;

public class GoogleClient {

  private static final String URL = "https://language.googleapis.com/v1/documents:classifyText?key=";
  private final OkHttpClient http = new OkHttpClient();
  private final String apiKey;

  private String ensureMinLength(String input) {

    if (input == null || input.trim().isEmpty()) return input;

    int charMin = 1000;
    int tokenMin = 20;

    String[] tokens = input.trim().split("\\s+");
    StringBuilder sb = new StringBuilder(input);

    while (sb.length() < charMin || tokens.length < tokenMin) {
      sb.append(" ").append(input);
      tokens = sb.toString().trim().split("\\s+");
    }

    return sb.toString().trim();
  }

  public GoogleClient(String apiKey) { this.apiKey = apiKey; }

  public Category classify(String title) {
  try {
    // Ensure title input long enough for classifyText API
    String processedTitle = ensureMinLength(title);

    // Request content
    JsonObject doc  = new JsonObject();
    doc.addProperty("type", "PLAIN_TEXT");
    doc.addProperty("content", processedTitle);

    // Request body
    JsonObject body = new JsonObject();
    body.add("document", doc);

    // Build request for Google NLP
    Request req = new Request.Builder()
        .url(URL + apiKey)
        .post(RequestBody.create(body.toString(), MediaType.parse("application/json")))
        .build();

    Response rsp = http.newCall(req).execute();
    if (!rsp.isSuccessful()) return null;

    // Parse response 
    JsonObject json = JsonParser.parseString(rsp.body().string()).getAsJsonObject();

    JsonArray categories  = json.getAsJsonArray("categories");
    if (categories == null || categories.size() == 0) return null;

    JsonObject bestCategory = categories.get(0).getAsJsonObject();
    return new Category(
        bestCategory.get("name").getAsString(),
        bestCategory.get("confidence").getAsDouble()
    );

  } catch (Exception e) {

    // If exception is thrown - return null for Category
    return null;
  }

  }
}
