import { GlobalProps } from '@/lib/model/shared.model';

function Page(props: GlobalProps) {
    const { params } = props;
    return(
        <>{props.params.slug}</>
    )
}

export default Page;
