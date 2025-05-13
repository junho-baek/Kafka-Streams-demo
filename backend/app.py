from fastapi import FastAPI
import socketio
from confluent_kafka import Producer, Consumer
import asyncio
from contextlib import asynccontextmanager

# Kafka 설정
KAFKA_BROKER = "<EC2주소>:9092"
INPUT_TOPIC = "team-candidates"
OUTPUT_TOPIC = "team-approved"

# Kafka Producer
producer_conf = {'bootstrap.servers': KAFKA_BROKER}
producer = Producer(producer_conf)

# Kafka Consumer
consumer_conf = {
    'bootstrap.servers': KAFKA_BROKER,
    'group.id': 'chat-consumer',
    'auto.offset.reset': 'latest'
}
consumer = Consumer(consumer_conf)
consumer.subscribe([OUTPUT_TOPIC])

# Socket.IO + FastAPI 설정
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

@sio.event
async def connect(sid, environ):
    print("Client connected:", sid)

@sio.event
async def send_msg(sid, data):
    print("Message from client:", data)
    try:
        producer.produce(INPUT_TOPIC, data.encode("utf-8"))
        producer.flush()
        print(f"Successfully produced message to {INPUT_TOPIC}")
    except Exception as e:
        print(f"Error producing message: {e}")

# Kafka → Socket.IO 브로드캐스트
async def kafka_consume_loop():
    print(f"Starting Kafka consumer for topic: {OUTPUT_TOPIC}")
    while True:
        try:
            msg = consumer.poll(1.0)
            if msg and not msg.error():
                print(f"Received message from Kafka: {msg.value().decode('utf-8')}")
                await sio.emit("chat", msg.value().decode("utf-8"))
            elif msg.error():
                print(f"Kafka error: {msg.error()}")
        except Exception as e:
            print(f"Error in consumer loop: {e}")
        await asyncio.sleep(0.1)

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(kafka_consume_loop())
    yield

app = FastAPI(lifespan=lifespan)
sio_app = socketio.ASGIApp(sio, app)