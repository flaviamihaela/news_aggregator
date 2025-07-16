package com.example.googlenlpsmt;

// Imports
import org.apache.kafka.connect.connector.ConnectRecord;
import org.apache.kafka.connect.data.Schema;
import org.apache.kafka.connect.data.SchemaBuilder;
import org.apache.kafka.connect.data.Struct;
import org.apache.kafka.connect.transforms.Transformation;
import org.apache.kafka.connect.transforms.util.SimpleConfig;
import org.apache.kafka.common.config.ConfigDef;
import org.apache.kafka.common.config.ConfigDef.Importance;
import org.apache.kafka.common.config.ConfigDef.Type;
import org.apache.kafka.common.config.ConfigException;
import java.util.Map;

/*
    SMT for Kafka Connect that classifies an article title with Google NLP -
    if above threshold, adds "category" field to schema

    Transformation interface has 4 functions that need overriding - congigure, config, apply, close
*/

public class AddContentCategory<R extends ConnectRecord<R>> implements Transformation<R> {

    public static final String API_KEY_CONFIG = "api.key";
    public static final String MIN_SCORE_CONFIG = "min.score";

    // Kafka Connect config options
    private static final ConfigDef CONFIG_DEF = new ConfigDef()
            .define(API_KEY_CONFIG, Type.STRING, Importance.HIGH, "GoogleNLP API key")
            .define(MIN_SCORE_CONFIG, Type.DOUBLE, 0.4, Importance.MEDIUM, "Min confidence threshold");

    private GoogleClient nlp;
    private double minScore;

    // Configure method for Kafka Connect Transformation interface
    @Override
    public void configure(Map<String, ?> props) {
        final SimpleConfig cfg = new SimpleConfig(CONFIG_DEF, props);

        final String apiKey = cfg.getString(API_KEY_CONFIG);

        if (apiKey == null || apiKey.isEmpty())
            throw new ConfigException(API_KEY_CONFIG, apiKey, "must be non-empty");

        minScore = cfg.getDouble(MIN_SCORE_CONFIG);

        nlp = new GoogleClient(apiKey);
    }

    // Apply method for Kafka Connect Transformation interface - it gets applied to each record
    @Override
    public R apply(R record) {
        // Retrieves record schema and the values it holds
        Struct values = (Struct) record.value();
        Schema schema = record.valueSchema();

        // Check if category field exists - if not add to schema
        if (schema.field("category") == null) {
            SchemaBuilder builder = SchemaBuilder.struct();

            schema.fields().forEach(f -> builder.field(f.name(), f.schema()));

            builder.field("category", Schema.OPTIONAL_STRING_SCHEMA);
            //Build new schema 
            schema = builder.build();
        }

        // Retrieves title value of record and sets new category field to null
        String title = values.getString("title");
        String category = null;

        // Classifies article title using Google NLP 
        if (title != null) {
            Category cat = nlp.classify(title);
            if (cat != null && cat.confidence() >= minScore) {
                category = cat.name().split("/")[1];
            }
        }

        Struct updatedValues = new Struct(schema);
        // Copy values of existing fields
        schema.fields().forEach(f -> {
            if (values.schema().field(f.name()) != null) {
                updatedValues.put(f.name(), values.get(f.name()));
            }
        });

        // Only set category when not null
        if (category != null) {
            updatedValues.put("category", category);
        }

        // Return the new record object 
        return record.newRecord(
                record.topic(), record.kafkaPartition(), record.keySchema(), record.key(),
                schema, updatedValues, record.timestamp());

    }

    // Config method for Kafka Connect Transformation interface
    @Override public ConfigDef config() { return CONFIG_DEF; }

    // Close method for Kafka Connect Transformation interface
    @Override public void close() { }

    public String version() { return "1.0.1"; }
}
