import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.*;
import org.apache.kafka.streams.kstream.*;

import java.util.Properties;
import java.util.Set;

public class ChatStreamApp {
    public static void main(String[] args) {
        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "chat-filter-app");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "<EC2 주소>:9092"); //EC2 주소
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG, Serdes.String().getClass());
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG, Serdes.String().getClass());

        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, String> input = builder.stream("team-candidates");

        Set<String> banned = Set.of("백준호", "방준현");

        input.mapValues(value -> {
            for (String name : banned) {
                if (value.contains(name)) {
                    return value + "이 사람은 금지된 사람입니다^^";
                }
            }
            return value;
        }).to("team-approved");

        KafkaStreams streams = new KafkaStreams(builder.build(), props);
        streams.start();
        Runtime.getRuntime().addShutdownHook(new Thread(streams::close));
    }
}