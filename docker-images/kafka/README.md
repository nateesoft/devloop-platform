# 🚀 Kafka for TON Lowcode Platform

## ภาพรวม

Apache Kafka configuration สำหรับ TON Lowcode Platform ที่ออกแบบมาเพื่อ:
- **Event-Driven Architecture** - ระบบที่ขับเคลื่อนด้วย events
- **Real-time Data Processing** - ประมวลผลข้อมูลแบบ real-time
- **Microservices Communication** - การสื่อสารระหว่าง services
- **Audit & Analytics** - บันทึกการใช้งานและการวิเคราะห์
- **Scalable Messaging** - ระบบส่งข้อความที่ขยายได้

## 🏗️ Architecture

```
TON Lowcode Platform Services
        ↓
    Kafka Cluster
        ├─ user.activity (user actions)
        ├─ flow.execution (flow processing)
        ├─ notifications (real-time alerts)
        ├─ audit.logs (security events)
        ├─ analytics.events (usage data)
        ├─ collaboration.events (real-time collab)
        └─ media.events (file operations)
```

## 📊 Pre-configured Topics

### 🎯 Business Logic Topics
- **user.activity** (3 partitions) - User actions, login/logout events
- **flow.execution** (5 partitions) - Flow processing requests
- **flow.completed** (3 partitions) - Successful flow completions  
- **flow.failed** (3 partitions) - Failed flow executions

### 📢 Notification Topics
- **notifications** (3 partitions) - Real-time user notifications
- **collaboration.events** (5 partitions) - Real-time collaboration

### 📊 Analytics Topics
- **analytics.events** (5 partitions) - Usage analytics, feature adoption
- **audit.logs** (3 partitions) - Security audit trail

### 🗄️ Data Topics
- **media.events** (3 partitions) - File upload/download events
- **database.changes** (3 partitions) - Database change events (CDC)

### ⚠️ Error Handling
- **error.events** (1 partition) - Application errors
- **dead.letter.queue** (1 partition) - Failed message handling

## 🚀 การติดตั้งและใช้งาน

### Quick Start
```bash
# เข้าไปที่ Kafka directory
cd docker-images/kafka

# รัน setup script (แนะนำ)
./setup-kafka.sh

# หรือ manual start
docker compose up -d
```

### Manual Setup
```bash
# 1. สร้าง network (ถ้ายังไม่มี)
docker network create lowcode-network

# 2. Start Zookeeper first
docker compose up -d zookeeper

# 3. Wait for Zookeeper, then start Kafka
sleep 30
docker compose up -d kafka

# 4. Start Kafka UI
docker compose up -d kafka-ui

# 5. Initialize topics (automatic via kafka-init service)
```

## 🔧 Configuration Details

### 🎯 Kafka Configuration Highlights

#### Performance Settings
```yaml
# Memory allocation
KAFKA_HEAP_OPTS: "-Xmx1G -Xms1G"

# Message settings
KAFKA_MESSAGE_MAX_BYTES: 1000000  # 1MB max message
KAFKA_REPLICA_FETCH_MAX_BYTES: 1048576

# Retention
KAFKA_LOG_RETENTION_HOURS: 168  # 7 days
KAFKA_LOG_RETENTION_BYTES: 1073741824  # 1GB
```

#### Reliability Settings
```yaml
# Replication
KAFKA_DEFAULT_REPLICATION_FACTOR: 1  # Single node (increase for prod)
KAFKA_MIN_INSYNC_REPLICAS: 1

# Transaction support
KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
```

#### Network Configuration
```yaml
# Internal/External listeners
KAFKA_LISTENERS: INTERNAL://0.0.0.0:29092,EXTERNAL://0.0.0.0:9092
KAFKA_ADVERTISED_LISTENERS: INTERNAL://lowcode-kafka:29092,EXTERNAL://localhost:9092
KAFKA_INTER_BROKER_LISTENER_NAME: INTERNAL
```

## 📊 Use Cases Implementation

### 🎪 1. User Activity Tracking
```typescript
// Publish user events
const userActivity = {
  userId: "user123",
  action: "flow.executed",
  flowId: "flow456", 
  timestamp: Date.now(),
  duration: 1500,
  success: true,
  metadata: {
    browser: "Chrome",
    ip: "192.168.1.100"
  }
};

await kafka.publish('user.activity', userActivity);
```

### 🔄 2. Flow Execution Events
```typescript
// Async flow processing
const flowExecution = {
  executionId: "exec789",
  flowId: "flow456",
  userId: "user123",
  inputData: { name: "John", age: 30 },
  priority: "normal",
  requestedAt: Date.now()
};

await kafka.publish('flow.execution', flowExecution);
```

### 📢 3. Real-time Notifications
```typescript
// Send notifications
const notification = {
  userId: "user123",
  type: "flow.completed",
  title: "Flow Completed Successfully",
  message: "Your data processing flow has completed",
  data: { flowId: "flow456", result: "success" },
  channels: ["web", "email"],
  timestamp: Date.now()
};

await kafka.publish('notifications', notification);
```

### 🔒 4. Security Audit Events
```typescript
// Log security events
const auditEvent = {
  userId: "user123",
  action: "secret.accessed",
  resource: "secret456",
  resourceType: "vault_secret",
  ip: "192.168.1.100",
  userAgent: "Chrome/91.0",
  timestamp: Date.now(),
  success: true,
  metadata: {
    method: "GET",
    endpoint: "/api/secrets/456"
  }
};

await kafka.publish('audit.logs', auditEvent);
```

### 📊 5. Analytics Events
```typescript
// Track feature usage
const analyticsEvent = {
  eventType: "feature.used",
  feature: "page.builder",
  userId: "user123",
  sessionId: "session789",
  properties: {
    componentsUsed: ["button", "form", "table"],
    pageType: "dashboard",
    buildTime: 3000
  },
  timestamp: Date.now()
};

await kafka.publish('analytics.events', analyticsEvent);
```

### 🤝 6. Collaboration Events  
```typescript
// Real-time collaboration
const collabEvent = {
  eventType: "cursor.moved",
  flowId: "flow456", 
  userId: "user123",
  sessionId: "session789",
  data: {
    position: { x: 150, y: 200 },
    nodeId: "node123"
  },
  timestamp: Date.now()
};

await kafka.publish('collaboration.events', collabEvent);
```

## 🔍 Monitoring & Management

### Access URLs
- **Kafka Broker**: localhost:9092
- **Kafka UI**: http://localhost:8083 (admin/admin123)
- **Zookeeper**: localhost:2181

### Kafka CLI Commands
```bash
# List topics
docker exec lowcode-kafka kafka-topics --list --bootstrap-server localhost:9092

# Topic details
docker exec lowcode-kafka kafka-topics --describe --topic user.activity --bootstrap-server localhost:9092

# Produce test message
echo '{"userId":"test123","action":"test"}' | docker exec -i lowcode-kafka kafka-console-producer --bootstrap-server localhost:9092 --topic user.activity

# Consume messages
docker exec lowcode-kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic user.activity --from-beginning

# Consumer group info
docker exec lowcode-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list
```

### Performance Monitoring
```bash
# Broker metrics
docker exec lowcode-kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Topic metrics  
docker exec lowcode-kafka kafka-log-dirs --bootstrap-server localhost:9092 --describe

# Consumer lag
docker exec lowcode-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group your-group-name
```

## 📋 Event Schema Design

### Standard Event Format
```typescript
interface BaseEvent {
  eventId: string;          // Unique event identifier
  eventType: string;        // Event type/category
  timestamp: number;        // Unix timestamp
  version: string;          // Schema version
  source: string;           // Source service
  userId?: string;          // User identifier
  sessionId?: string;       // Session identifier
  correlationId?: string;   // Request correlation
  metadata?: any;           // Additional data
}
```

### Specific Event Schemas

#### User Activity Event
```typescript
interface UserActivityEvent extends BaseEvent {
  eventType: 'user.login' | 'user.logout' | 'user.action';
  action: string;           // Specific action taken
  resource?: string;        // Resource accessed
  success: boolean;         // Action success status
  duration?: number;        // Action duration (ms)
  ip: string;              // Client IP address
  userAgent: string;       // Client user agent
}
```

#### Flow Execution Event
```typescript
interface FlowExecutionEvent extends BaseEvent {
  eventType: 'flow.requested' | 'flow.started' | 'flow.completed' | 'flow.failed';
  executionId: string;      // Unique execution ID
  flowId: string;          // Flow template ID
  inputData?: any;         // Input parameters
  outputData?: any;        // Execution results
  error?: string;          // Error message (if failed)
  duration?: number;       // Execution time (ms)
  steps?: Array<{          // Execution steps
    stepId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    duration?: number;
  }>;
}
```

## 🎯 Integration with Lowcode Platform

### NestJS Kafka Service
```typescript
// kafka.service.ts
@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor() {
    this.kafka = new KafkaJS({
      clientId: 'lowcode-platform',
      brokers: ['localhost:9092'],
      retry: {
        retries: 3,
        initialRetryTime: 300,
        maxRetryTime: 30000,
      }
    });
  }

  async onModuleInit() {
    this.producer = this.kafka.producer({
      transactionTimeout: 30000,
      idempotent: true, // Exactly-once semantics
    });
    await this.producer.connect();

    this.consumer = this.kafka.consumer({
      groupId: 'lowcode-platform-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
    await this.consumer.connect();
  }

  async publish(topic: string, message: any) {
    const kafkaMessage = {
      value: JSON.stringify({
        ...message,
        eventId: uuidv4(),
        timestamp: Date.now(),
        source: 'lowcode-platform'
      })
    };

    await this.producer.send({
      topic,
      messages: [kafkaMessage]
    });
  }

  async publishBatch(topic: string, messages: any[]) {
    const kafkaMessages = messages.map(message => ({
      value: JSON.stringify({
        ...message,
        eventId: uuidv4(),
        timestamp: Date.now(),
        source: 'lowcode-platform'
      })
    }));

    await this.producer.send({
      topic,
      messages: kafkaMessages
    });
  }

  async subscribe(topics: string[], handler: (message: any) => Promise<void>) {
    await this.consumer.subscribe({ topics });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          await handler(data);
        } catch (error) {
          console.error('Error processing Kafka message:', error);
          // Send to dead letter queue
          await this.publish('dead.letter.queue', {
            originalTopic: topic,
            originalMessage: message.value.toString(),
            error: error.message
          });
        }
      },
    });
  }
}
```

### Event-Driven Flow Processor
```typescript
// flow-processor.service.ts
@Injectable()
export class FlowProcessorService {
  constructor(private kafkaService: KafkaService) {
    // Subscribe to flow execution requests
    this.kafkaService.subscribe(['flow.execution'], this.processFlow.bind(this));
  }

  async processFlow(event: FlowExecutionEvent) {
    const { executionId, flowId, userId, inputData } = event;

    try {
      // Start flow processing
      await this.kafkaService.publish('flow.execution', {
        eventType: 'flow.started',
        executionId,
        flowId,
        userId
      });

      // Process the flow (business logic)
      const result = await this.executeFlowLogic(flowId, inputData);

      // Publish success event
      await this.kafkaService.publish('flow.completed', {
        eventType: 'flow.completed',
        executionId,
        flowId,
        userId,
        outputData: result,
        duration: Date.now() - event.timestamp
      });

      // Send notification
      await this.kafkaService.publish('notifications', {
        userId,
        type: 'flow.completed',
        title: 'Flow Completed',
        data: { executionId, result }
      });

    } catch (error) {
      // Publish failure event
      await this.kafkaService.publish('flow.failed', {
        eventType: 'flow.failed',
        executionId,
        flowId,
        userId,
        error: error.message,
        duration: Date.now() - event.timestamp
      });
    }
  }

  private async executeFlowLogic(flowId: string, inputData: any) {
    // Your flow execution logic here
    return { success: true, processedData: inputData };
  }
}
```

### Real-time Notification Service
```typescript
// notification.service.ts
@Injectable()
export class NotificationService implements OnModuleInit {
  private connectedClients = new Map<string, WebSocket>();

  constructor(private kafkaService: KafkaService) {}

  async onModuleInit() {
    // Subscribe to notification events
    await this.kafkaService.subscribe(['notifications'], this.handleNotification.bind(this));
  }

  async handleNotification(event: any) {
    const { userId, type, title, message, data } = event;

    // Send WebSocket notification
    const client = this.connectedClients.get(userId);
    if (client?.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type,
        title,
        message,
        data,
        timestamp: Date.now()
      }));
    }

    // Store notification in database for later retrieval
    await this.storeNotification(userId, { type, title, message, data });
  }

  addClient(userId: string, ws: WebSocket) {
    this.connectedClients.set(userId, ws);
    
    ws.on('close', () => {
      this.connectedClients.delete(userId);
    });
  }

  private async storeNotification(userId: string, notification: any) {
    // Store in database for users who are offline
  }
}
```

## 🔒 Security & Best Practices

### Message Encryption (Production)
```yaml
# SASL/SSL configuration for production
KAFKA_SECURITY_PROTOCOL: SASL_SSL
KAFKA_SASL_MECHANISM: SCRAM-SHA-256
KAFKA_SSL_ENDPOINT_IDENTIFICATION_ALGORITHM: ""
```

### Schema Validation
```typescript
// Schema validation using Joi or class-validator
import Joi from 'joi';

const userActivitySchema = Joi.object({
  eventType: Joi.string().valid('user.login', 'user.logout', 'user.action').required(),
  userId: Joi.string().required(),
  action: Joi.string().required(),
  timestamp: Joi.number().required(),
  ip: Joi.string().ip().required()
});

// Validate before publishing
export const validateAndPublish = async (topic: string, data: any, schema: Joi.Schema) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new Error(`Invalid event data: ${error.message}`);
  }
  await kafkaService.publish(topic, value);
};
```

### Dead Letter Queue Handling
```typescript
// Dead letter queue processor
@Injectable()
export class DeadLetterQueueProcessor {
  constructor(private kafkaService: KafkaService) {
    this.kafkaService.subscribe(['dead.letter.queue'], this.processDLQ.bind(this));
  }

  async processDLQ(event: any) {
    console.error('Processing failed message:', event);
    
    // Log to monitoring system
    // Retry logic
    // Alert administrators
  }
}
```

## 📊 Monitoring & Alerting

### Kafka Metrics to Monitor
- **Broker metrics**: CPU, memory, disk usage
- **Topic metrics**: Message rate, byte rate, partition count
- **Consumer lag**: How far behind consumers are
- **Producer metrics**: Batch size, compression ratio
- **Network metrics**: Request rate, response time

### Prometheus Integration
```yaml
# JMX metrics for Prometheus (add to kafka service)
environment:
  KAFKA_JMX_PORT: 9999
  KAFKA_JMX_HOSTNAME: lowcode-kafka
  KAFKA_OPTS: "-javaagent:/opt/jmx-exporter/jmx_prometheus_javaagent.jar=7071:/opt/jmx-exporter/kafka-broker.yml"
```

### Grafana Dashboard Queries
```promql
# Message throughput
rate(kafka_server_brokertopicmetrics_messagesin_total[5m])

# Consumer lag
kafka_consumer_lag_sum

# Error rate
rate(kafka_server_brokertopicmetrics_failedproducerequests_total[5m])
```

## 🛠️ Troubleshooting

### Common Issues

#### Kafka Won't Start
```bash
# Check Zookeeper first
docker logs lowcode-zookeeper

# Check disk space
df -h

# Check if ports are available
netstat -tulpn | grep :9092
```

#### Consumer Lag Issues
```bash
# Check consumer group status
docker exec lowcode-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group lowcode-platform-group

# Reset consumer offsets (if needed)
docker exec lowcode-kafka kafka-consumer-groups --bootstrap-server localhost:9092 --group lowcode-platform-group --reset-offsets --to-earliest --topic user.activity --execute
```

#### Message Loss Prevention
```typescript
// Use transactions for exactly-once semantics
await producer.transaction({
  timeout: 30000
}, async (tx) => {
  await tx.send({
    topic: 'user.activity',
    messages: [{ value: JSON.stringify(event) }]
  });
  
  // Update database in same transaction
  await database.updateUserActivity(userId, event);
});
```

## 🚀 Production Considerations

### High Availability Setup
```yaml
# Multi-broker cluster
version: '3.8'
services:
  kafka-1:
    image: confluentinc/cp-kafka:latest
    environment:
      KAFKA_BROKER_ID: 1
      # ... other config

  kafka-2:
    image: confluentinc/cp-kafka:latest
    environment:
      KAFKA_BROKER_ID: 2
      # ... other config

  kafka-3:
    image: confluentinc/cp-kafka:latest
    environment:
      KAFKA_BROKER_ID: 3
      # ... other config
```

### Scaling Guidelines
- **3+ brokers** for production
- **Replication factor 3** for important topics
- **Monitor consumer lag** and scale consumers accordingly
- **Partition strategy** based on expected throughput
- **Retention policies** based on storage capacity

### Backup & Recovery
```bash
# Topic configuration backup
docker exec lowcode-kafka kafka-configs --bootstrap-server localhost:9092 --describe --entity-type topics

# Create topic snapshots
docker exec lowcode-kafka kafka-mirror-maker --consumer.config consumer.properties --producer.config producer.properties --whitelist ".*"
```

---

*Apache Kafka - Event-Driven Messaging for TON Lowcode Platform* 🚀