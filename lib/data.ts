
export function formatarData(data: string) {
    if (!data) return ""
    const [ano, mes, dia] = data.split("-")
    return `${dia}/${mes}/${ano}`
}

export function getStatusColor(status: string) {
    switch (status) {
        case "confirmado":
            return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        case "realizado":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        case "cancelado":
            return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
        default:
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    }
}
