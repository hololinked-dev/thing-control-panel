import { Stack, Box, useTheme, TextField } from "@mui/material";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-crimson_editor"
import "ace-builds/src-noconflict/ext-language_tools";


type InputChoiceProps = {
    choice: string 
    jsonSchema: any
    value: any
    setValue: any
}

export const InputChoice = (props : InputChoiceProps) => {

    const theme = useTheme()
    const { choice, jsonSchema, value, setValue } = props

    switch(choice) {
        case 'JSON' : return (
                            <Box id="ace-editor-box" sx= {{ flexGrow : 1 }}>
                                <AceEditor
                                    name="client-json-input"
                                    mode="json"
                                    theme="crimson_editor"
                                    value={
                                        value? value : 
                                            jsonSchema.type === 'object'? 
                                            jsonSchema.properties ? 
                                            `{${Object.keys(jsonSchema.properties).map(key => `\n\t"${key}": `).join(',').slice(0, -1)}\n}` 
                                            : '' : ''
                                    }
                                    onChange={(newValue) => setValue(newValue)}
                                    fontSize={18}
                                    showPrintMargin={true}
                                    showGutter={true}
                                    highlightActiveLine={true}
                                    wrapEnabled={true}
                                    style={{
                                        backgroundColor: theme.palette.grey[100],
                                        maxHeight: 175,
                                        overflow: 'scroll',
                                        scrollBehavior: 'smooth',
                                        width: "100%",
                                    }}
                                    setOptions={{
                                        enableBasicAutocompletion: true,
                                        enableLiveAutocompletion: true,
                                        enableSnippets: false,
                                        showLineNumbers: true,
                                        tabSize: 4,
                                    }}
                                />
                            </Box>
                        )
        default : return (
                        <TextField
                            variant="outlined"
                            multiline
                            size="small"
                            maxRows={300}
                            onChange={(event) => setValue(event.target.value)}
                            helperText="press enter to expand"
                            sx={{ flexGrow: 1 }}
                        />
                    )
    }
}
