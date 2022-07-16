package maurycy.com

@kotlinx.serialization.Serializable
data class PlayerMsg(
    val side: Boolean,
    val msg: Int //0 up 1 down 2 start 3 stop
)