"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectContextType {
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

function Select({
    children,
    value,
    onValueChange,
    defaultValue = ""
}: {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
}) {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const [open, setOpen] = React.useState(false)

    const isControlled = value !== undefined
    const currentValue = isControlled ? value : internalValue

    const handleValueChange = React.useCallback((newValue: string) => {
        if (!isControlled) setInternalValue(newValue)
        onValueChange?.(newValue)
        setOpen(false)
    }, [isControlled, onValueChange])

    return (
        <SelectContext.Provider value={{
            value: currentValue,
            onValueChange: handleValueChange,
            open,
            setOpen
        }}>
            <div className="relative">
                {children}
            </div>
        </SelectContext.Provider>
    )
}

function SelectTrigger({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectTrigger must be used within Select")

    return (
        <button
            type="button"
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            onClick={() => context.setOpen(!context.open)}
            {...props}
        >
            {children}
            <span className="ml-2">▼</span>
        </button>
    )
}

function SelectValue({ placeholder }: { placeholder?: string }) {
    const context = React.useContext(SelectContext)
    if (!context) return null

    return <span>{context.value || placeholder}</span>
}

function SelectContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const context = React.useContext(SelectContext)
    if (!context?.open) return null

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={() => context.setOpen(false)}
            />
            <div
                className={cn(
                    "absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
                    className
                )}
                {...props}
            >
                <div className="p-1">
                    {children}
                </div>
            </div>
        </>
    )
}

function SelectItem({ children, value, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
    const context = React.useContext(SelectContext)
    if (!context) return null

    const isSelected = context.value === value

    return (
        <div
            className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                isSelected && "bg-accent",
                className
            )}
            onClick={() => context.onValueChange(value)}
            {...props}
        >
            {isSelected && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    ✓
                </span>
            )}
            {children}
        </div>
    )
}

export {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
}
