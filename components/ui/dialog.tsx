"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogContextType {
    open: boolean
    setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined)

function Dialog({ children, open, onOpenChange }: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const isControlled = open !== undefined
    const isOpen = isControlled ? open : internalOpen

    const setOpen = React.useCallback((value: boolean) => {
        if (!isControlled) setInternalOpen(value)
        onOpenChange?.(value)
    }, [isControlled, onOpenChange])

    return (
        <DialogContext.Provider value={{ open: isOpen, setOpen }}>
            {children}
        </DialogContext.Provider>
    )
}

function DialogTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
    const context = React.useContext(DialogContext)
    if (!context) throw new Error("DialogTrigger must be used within Dialog")

    const handleClick = () => context.setOpen(true)

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, { onClick: handleClick })
    }

    return <button onClick={handleClick}>{children}</button>
}

function DialogPortal({ children }: { children: React.ReactNode }) {
    const context = React.useContext(DialogContext)
    if (!context?.open) return null
    return <>{children}</>
}

function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const context = React.useContext(DialogContext)
    if (!context) return null

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 bg-black/80 animate-in fade-in-0",
                className
            )}
            onClick={() => context.setOpen(false)}
            {...props}
        />
    )
}

function DialogContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const context = React.useContext(DialogContext)
    if (!context) return null

    return (
        <DialogPortal>
            <DialogOverlay />
            <div
                className={cn(
                    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] sm:rounded-lg",
                    className
                )}
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                {children}
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => context.setOpen(false)}
                >
                    <span className="text-lg">×</span>
                    <span className="sr-only">Fechar</span>
                </button>
            </div>
        </DialogPortal>
    )
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
            {...props}
        />
    )
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
            {...props}
        />
    )
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2
            className={cn("text-lg font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    )
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
}

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}
