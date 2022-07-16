package maurycy.com

@kotlinx.serialization.Serializable
data class Game(
    var state: Int,
    val leftPlayerX: Int,
    var leftPlayerY: Int,
    val rightPlayerX: Int,
    var rightPlayerY: Int,
    var ballX: Int,
    var ballY: Int
){
    var delta = Pair(5,5)
    fun moveBall(){
        var deltaX = delta.first
        var deltaY = delta.first
        if(ballX<=20){
            if(ballY>leftPlayerY && ballY<leftPlayerY+100){
                deltaX=-deltaX
            }else {
                state = 2
                println("win Right")
            }
        }
        if(ballX>=480){
            if(ballY>rightPlayerY && ballY<rightPlayerY+100){
                deltaX=-deltaX
            }else {
                state = 3
                println("win Left")
            }
        }
        ballX+=deltaX
        if(ballY==30){
            deltaY=-deltaY
        }
        if(ballY==470){
            deltaY=-deltaY
        }
        ballY+=deltaY

        delta =  Pair(deltaX, deltaY)
    }

    fun reset() {
        this.state = 0
        this.ballX = 250
        this.ballY = 250
    }
}

