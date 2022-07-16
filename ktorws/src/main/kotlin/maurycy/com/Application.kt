package maurycy.com

import io.ktor.server.engine.*
import io.ktor.server.netty.*
import maurycy.com.plugins.*


@ExperimentalUnsignedTypes
fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {
        configureSockets()
    }.start(wait = true)
}
