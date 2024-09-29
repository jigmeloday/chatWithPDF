import { SkeletonProps } from '@/components/model/components.model';

function Skeleton(props: SkeletonProps) {
    const { className } = props;
    return(
        <div className={`w-full animate-pulse h-4 bg-gray-300 dark:bg-gray-700 rounded ${className}`}/>

    )
}

export default Skeleton;
