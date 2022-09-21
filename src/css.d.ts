declare module '*css' {
    const styles: { [key: string]: string };
    export = styles
}

declare module "*.gif" {
    const value: string;
    export default value;
}