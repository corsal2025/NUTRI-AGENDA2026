import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={twMerge(
                "bg-white rounded-2xl shadow-soft p-6 border border-gray-100",
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: CardProps) {
    return <div className={twMerge("mb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={twMerge("text-lg font-semibold text-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
    return <div className={twMerge("", className)} {...props} />;
}
