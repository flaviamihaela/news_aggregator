package com.example.googlenlpsmt;

// Class for Google NLP classification result
public final class Category {
  private final String name;
  private final double confidence;

  public Category(String name, double confidence) {
    this.name = name;
    this.confidence = confidence;
  }
  public String name() { return name; }
  public double confidence() { return confidence; }
}