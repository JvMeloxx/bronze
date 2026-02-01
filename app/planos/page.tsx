"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function PlanosPage() {
    // URLs do checkout Kiwify
    const KIWIFY_BASICO = "https://pay.kiwify.com.br/eKc4uYx"
    const KIWIFY_PROFISSIONAL = "https://pay.kiwify.com.br/8o7B65P"

    const planos = [
        {
            id: "basico",
            nome: "Básico",
            preco: 49.90,
            descricao: "Tudo que você precisa para gerenciar seu studio",
            destaque: false,
            checkoutUrl: KIWIFY_BASICO,
            features: [
                "✅ Agendamentos ilimitados",
                "✅ Gestão de clientes",
                "✅ Página de agendamento online",
                "✅ Notificações WhatsApp",
                "✅ Previsão do tempo integrada",
                "✅ Pagamento PIX configurável",
                "✅ Relatórios básicos",
                "✅ Suporte por WhatsApp",
            ]
        },
        {
            id: "profissional",
            nome: "Profissional",
            preco: 99.90,
            descricao: "Para studios que querem crescer ainda mais",
            destaque: true,
            checkoutUrl: KIWIFY_PROFISSIONAL,
            emBreve: true,
            features: [
                "✅ Tudo do plano Básico",
                "✅ Artes prontas para divulgação",
                "✅ Templates para Instagram/Stories",
                "✅ Banco de imagens exclusivo",
                "✅ Suporte prioritário",
                "🔜 Mais recursos em breve...",
            ]
        }
    ]

    const faq = [
        {
            pergunta: "Como funciona o período de teste?",
            resposta: "Você pode testar o sistema por 7 dias gratuitamente. Se não gostar, é só cancelar antes do fim do período."
        },
        {
            pergunta: "Posso cancelar a qualquer momento?",
            resposta: "Sim! Você pode cancelar sua assinatura quando quiser, sem multas ou taxas adicionais."
        },
        {
            pergunta: "Como funciona o suporte?",
            resposta: "No plano Básico você tem suporte por WhatsApp em horário comercial. No Profissional, suporte prioritário com resposta em até 2 horas."
        },
        {
            pergunta: "Preciso ter conhecimento técnico?",
            resposta: "Não! O SunSync foi feito para ser simples. Se você sabe usar WhatsApp, sabe usar o SunSync."
        },
        {
            pergunta: "Quantas clientes posso ter?",
            resposta: "Ilimitadas! Não temos limite de clientes ou agendamentos em nenhum plano."
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Header */}
            <header className="container mx-auto px-4 py-6">
                <nav className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center group-hover:animate-pulse transition-all">
                            <span className="text-white text-xl">☀️</span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            SunSync
                        </span>
                    </Link>
                    <Link href="/agendar">
                        <Button variant="outline" className="border-amber-300">
                            Ver Demo
                        </Button>
                    </Link>
                </nav>
            </header>

            {/* Hero */}
            <section className="container mx-auto px-4 py-12 text-center">
                <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-300">
                    🚀 Oferta de Lançamento
                </Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Escolha o plano ideal para seu{" "}
                    <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Studio
                    </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Organize seus agendamentos, fidelize suas clientes e aumente seu faturamento
                </p>
            </section>

            {/* Planos */}
            <section className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {planos.map((plano) => (
                        <Card
                            key={plano.id}
                            className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${plano.destaque
                                ? "border-2 border-amber-500 shadow-xl shadow-amber-500/20"
                                : "border-amber-200 dark:border-amber-800"
                                }`}
                        >
                            {plano.destaque && (
                                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                    MAIS POPULAR
                                </div>
                            )}
                            {plano.emBreve && (
                                <div className="absolute top-0 left-0 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                                    EM BREVE
                                </div>
                            )}
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-2xl">{plano.nome}</CardTitle>
                                <CardDescription>{plano.descricao}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Preço */}
                                <div className="text-center">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-lg text-muted-foreground">R$</span>
                                        <span className="text-5xl font-bold text-amber-600">
                                            {plano.preco.toFixed(2).split('.')[0]}
                                        </span>
                                        <span className="text-2xl text-amber-600">
                                            ,{plano.preco.toFixed(2).split('.')[1]}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">por mês</p>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3">
                                    {plano.features.map((feature, i) => (
                                        <li key={i} className="text-sm">
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Button
                                    size="lg"
                                    className={`w-full text-lg py-6 ${plano.destaque
                                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                        : "bg-amber-100 hover:bg-amber-200 text-amber-900"
                                        }`}
                                    onClick={() => {
                                        if (plano.emBreve) {
                                            alert("Este plano estará disponível em breve! Por enquanto, assine o plano Básico.")
                                        } else {
                                            window.open(plano.checkoutUrl, "_blank")
                                        }
                                    }}
                                    disabled={plano.emBreve}
                                >
                                    {plano.emBreve ? "Em Breve" : "Começar Agora"}
                                </Button>

                                {!plano.emBreve && (
                                    <p className="text-xs text-center text-muted-foreground">
                                        7 dias grátis • Cancele quando quiser
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Garantia */}
            <section className="container mx-auto px-4 py-12">
                <Card className="max-w-2xl mx-auto border-green-300 bg-green-50 dark:bg-green-950/30">
                    <CardContent className="p-8 text-center">
                        <span className="text-5xl block mb-4">🛡️</span>
                        <h3 className="text-2xl font-bold mb-2 text-green-700">
                            Garantia de 7 dias
                        </h3>
                        <p className="text-green-600">
                            Teste o SunSync por 7 dias. Se não gostar, devolvemos 100% do seu dinheiro.
                            Sem perguntas, sem burocracia.
                        </p>
                    </CardContent>
                </Card>
            </section>

            {/* FAQ */}
            <section className="container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-center mb-8">
                    Perguntas Frequentes
                </h2>
                <div className="max-w-2xl mx-auto space-y-4">
                    {faq.map((item, i) => (
                        <Card key={i} className="border-amber-200 dark:border-amber-800">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{item.pergunta}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{item.resposta}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* CTA Final */}
            <section className="container mx-auto px-4 py-16">
                <Card className="max-w-3xl mx-auto bg-gradient-to-br from-amber-500 to-orange-500 border-0 text-white">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-3xl font-bold mb-4">
                            Pronta para organizar seu studio?
                        </h2>
                        <p className="text-xl mb-6 text-white/90">
                            Junte-se a dezenas de profissionais que já usam o SunSync
                        </p>
                        <Button
                            size="lg"
                            className="bg-white text-amber-600 hover:bg-amber-50 text-lg px-8 py-6"
                            onClick={() => window.open(KIWIFY_BASICO, "_blank")}
                        >
                            Começar por R$ 49,90/mês
                        </Button>
                    </CardContent>
                </Card>
            </section>

            {/* Footer */}
            <footer className="border-t border-amber-200 dark:border-amber-800 py-8">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>© 2026 SunSync. Todos os direitos reservados.</p>
                    <p className="mt-2">
                        Dúvidas? Entre em contato pelo WhatsApp
                    </p>
                </div>
            </footer>
        </div>
    )
}
