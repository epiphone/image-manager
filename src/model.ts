/** https://cloud.google.com/storage/docs/json_api/v1/objects */
export interface CloudStorageObject {
  bucket: string
  id: string
  name: string
  metadata: Record<string, string>
  metageneration: number
  selfLink: string
  size: number
  timeCreated: string
  updated: string
}

/** https://cloud.google.com/pubsub/docs/reference/rest/v1/PubsubMessage */
export interface PubsubMessage {
  data: string
  attributes: Record<string, string>
  messageId: string
  publishTime: string
}

/** The context object for the event. https://cloud.google.com/functions/docs/writing/background#functions_background_parameters-node8-10 */
export interface Context {
  /** A unique ID for the event. For example: "70172329041928". */
  eventId: string

  /** The date/time (ISO 8601) this event was created. For example: "2018-04-09T07:56:12.975Z". */
  timestamp: string

  /** The type of the event. For example: "google.pubsub.topic.publish". */
  eventType: string

  /** The resource that emitted the event. */
  resource: string
}
