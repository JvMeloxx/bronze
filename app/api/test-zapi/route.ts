import { NextRequest, NextResponse } from "next/server"
import { verificarStatusZAPI, sendTextMessage } from "@/lib/zapi"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")
    const phone = searchParams.get("phone")

    // Verificar status da conexão
    if (action === "status") {
        const status = await verificarStatusZAPI()
        return NextResponse.json({
            instanceId: process.env.NEXT_PUBLIC_ZAPI_INSTANCE_ID ? "Configurado" : "NÃO CONFIGURADO",
            token: process.env.NEXT_PUBLIC_ZAPI_TOKEN ? "Configurado" : "NÃO CONFIGURADO",
            ...status
        })
    }

    // Enviar mensagem de teste
    if (action === "test" && phone) {
        const result = await sendTextMessage({
            phone,
            message: "🧪 Teste do SunSync - WhatsApp funcionando!"
        })
        return NextResponse.json(result)
    }

    return NextResponse.json({
        message: "API de teste Z-API",
        usage: {
            status: "/api/test-zapi?action=status",
            test: "/api/test-zapi?action=test&phone=5561999999999"
        }
    })
}
