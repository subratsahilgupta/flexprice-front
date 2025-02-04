import { Copy } from "lucide-react"; // Assuming Lucide icons
import { FC, useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface Props {
    data: any;
}

const JsonPreview: FC<Props> = ({ data }) => {


    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        toast.success("Copied to clipboard");
    };

    return (
        <div className="w-full card relative  p-4 rounded-md shadow">
            {/* Copy Button */}
            <Button onClick={copyToClipboard} className='text-muted-foreground cursor-pointer absolute top-4 right-4 size-8' variant={'ghost'}>
                <Copy className='' />
            </Button>

            {/* JSON Code Block with Syntax Highlighting */}
            <Highlight code={JSON.stringify(data, null, 2)} language="json" theme={themes.vsLight}>
                {({ style, tokens, getLineProps, getTokenProps }) => (
                    <pre className="!font-fira-code text-sm  rounded-md overflow-auto" style={style}>
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line })} className="font-fira-code">
                                {line.map((token, key) => (
                                    <span key={key} {...getTokenProps({ token })} className="!font-fira-code" />
                                ))}
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>
        </div>
    );
};

export default JsonPreview;
