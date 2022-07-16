package maurycy.com

import kotlinx.serialization.protobuf.schema.ProtoBufSchemaGenerator

fun main() {
    val descriptors = listOf(Game.serializer().descriptor, PlayerMsg.serializer().descriptor)
    val schemas = ProtoBufSchemaGenerator.generateSchemaText(descriptors)
    println(schemas)
}