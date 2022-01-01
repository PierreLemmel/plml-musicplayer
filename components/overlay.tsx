interface OverlayProps {
    readonly children: JSX.Element;

    readonly visible: boolean;
}

const Overlay = (props: OverlayProps) => <div className={`
    flex flex-col
    items-center justify-center
    w-screen h-screen
    absolute top-0 left-0
    transition-opacity duration-500
    ${props.visible ? 'opacity-100' : 'opacity-0'}
`}>
    {props.children}
</div>

export default Overlay;