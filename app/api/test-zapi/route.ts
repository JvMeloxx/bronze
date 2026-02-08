import { NextRequest, NextResponse } from "next/server"
import { formatPhoneNumber } from "@/lib/zapi"

const ZAPI_BASE_URL = "https://api.z-api.io/instances"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get("action")
    const phone = searchParams.get("phone")

    const instanceId = process.env.NEXT_PUBLIC_ZAPI_INSTANCE_ID || ""
    const token = process.env.NEXT_PUBLIC_ZAPI_TOKEN || ""
    const clientToken = process.env.NEXT_PUBLIC_ZAPI_CLIENT_TOKEN || ""

    // Verificar status da conexão
    if (action === "status") {
        try {
            const url = `${ZAPI_BASE_URL}/${instanceId}/token/${token}/status`
            const response = await fetch(url, {
                headers: clientToken ? { "Client-Token": clientToken } : {}
            })
            const data = await response.json()
            return NextResponse.json({
                instanceId: instanceId ? "Configurado" : "NÃO CONFIGURADO",
                token: token ? "Configurado" : "NÃO CONFIGURADO",
                clientToken: clientToken ? "Configurado" : "NÃO CONFIGURADO",
                apiResponse: data
            })
        } catch (error) {
            return NextResponse.json({ error: String(error) })
        }
    }

    // Enviar mensagem de teste
    if (action === "test" && phone) {
        try {
            const url = `${ZAPI_BASE_URL}/${instanceId}/token/${token}/send-text`
            const formattedPhone = formatPhoneNumber(phone)

            const headers: Record<string, string> = { "Content-Type": "application/json" }
            if (clientToken) {
                headers["Client-Token"] = clientToken
            }

            const response = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    phone: formattedPhone,
                    message: "🧪 Teste do SunSync - WhatsApp funcionando!"
                })
            })

            const data = await response.json()
            return NextResponse.json({
                success: response.ok,
                phoneUsed: formattedPhone,
                httpStatus: response.status,
                apiResponse: data
            })
        } catch (error) {
            return NextResponse.json({ error: String(error) })
        }
    }

    return NextResponse.json({
        message: "API de teste Z-API",
        usage: {
            status: "/api/test-zapi?action=status",
            test: "/api/test-zapi?action=test&phone=5561999999999"
        }
    })
}
