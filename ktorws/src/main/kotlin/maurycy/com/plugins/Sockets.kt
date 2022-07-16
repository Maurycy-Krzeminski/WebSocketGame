package maurycy.com.plugins

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.routing.routing
import io.ktor.server.websocket.DefaultWebSocketServerSession
import io.ktor.server.websocket.WebSockets
import io.ktor.server.websocket.pingPeriod
import io.ktor.server.websocket.timeout
import io.ktor.server.websocket.webSocket
import io.ktor.websocket.Frame
import io.ktor.websocket.readBytes
import io.ktor.websocket.send
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.decodeFromByteArray
import kotlinx.serialization.encodeToByteArray
import kotlinx.serialization.protobuf.ProtoBuf
import maurycy.com.Game
import maurycy.com.PlayerMsg
import java.time.Duration

val connections = mutableListOf<Pair<DefaultWebSocketServerSession, String?>>()
val games = mutableListOf<Game>()

@ExperimentalUnsignedTypes
@ExperimentalSerializationApi
fun Application.configureSockets() {
    install(WebSockets) {
        pingPeriod = Duration.ofSeconds(15)
        timeout = Duration.ofSeconds(15)
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }

    games.add(Game(0, 0, 50, 490, 50, 250, 250))
    games.add(Game(0, 0, 50, 490, 50, 250, 250))
    games.add(Game(0, 0, 50, 490, 50, 250, 250))
    games.add(Game(0, 0, 50, 490, 50, 250, 250))

    val scheduledEventFlow = flow {
        while (true) {
            delay(100)
            emit(1)
        }
    }
    val scope = GlobalScope
    scheduledEventFlow.onEach { doScheduledJob() }.launchIn(scope)
    routing {

        webSocket("/{room}") { // websocketSession
            val room = call.parameters["room"]
            val thisConnection = this
            connections += Pair(thisConnection, room)
            try {
                val data = games[room?.toInt()!!]
                for (frame in incoming) {
                    when (frame) {
                        is Frame.Binary -> {
                            val bytes = frame.readBytes()
                            try {
                                val msgRcv = ProtoBuf.decodeFromByteArray<PlayerMsg>(bytes = bytes)
                                if (msgRcv.msg == 0) {
                                    if (msgRcv.side && data.leftPlayerY > 0) data.leftPlayerY -= 10
                                    if (!msgRcv.side && data.rightPlayerY > 0) data.rightPlayerY -= 10
                                }
                                else if (msgRcv.msg == 1) {
                                    if (msgRcv.side && data.leftPlayerY < 400) data.leftPlayerY += 10
                                    if (!msgRcv.side && data.rightPlayerY < 400) data.rightPlayerY += 10
                                }
                                else if (msgRcv.msg == 2) {
                                    data.state = 1
                                }
                                else if (msgRcv.msg == 3) {
                                    data.state = 0
                                }
                                else if (msgRcv.msg == 4) {
                                    println("restart")
                                    data.reset()
                                    games[room.toInt()].reset()
                                }
                            } catch (e: java.lang.Exception) {
                                println(e)
                            }
                        }
                        else -> {}
                    }
                }
            } catch (e: Exception) {
                println(e.localizedMessage)
            } finally {
                println("Removing $thisConnection!")
                connections.remove(Pair(thisConnection, room))
            }

        }
    }
}

suspend fun doScheduledJob() {
    games.forEach {
        if (it.state == 1) {
            it.moveBall()
        }
    }
    connections.forEach { entry ->
        val data = games[entry.second!!.toInt()]
        if (data.state == 1) {
            val msgSend: ByteArray = ProtoBuf.encodeToByteArray(data)
            entry.first.send(msgSend)
        }
    }
}
