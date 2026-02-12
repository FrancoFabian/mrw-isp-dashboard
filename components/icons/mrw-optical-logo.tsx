import Image from "next/image"
import { ComponentProps } from "react"

export function MrwOpticalLogo({
    className,
    width = 120,
    height = 40,
    priority = true,
    ...props
}: Omit<ComponentProps<typeof Image>, "src" | "alt">) {
    return (
        <Image
            src="/MrwOpticalA.svg"
            alt="MRW ISP"
            width={width}
            height={height}
            className={className}
            priority={priority}
            {...props}
        />
    )
}
