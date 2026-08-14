export async function loadEditorTools() {
  const [
    editorModule,
    headerModule,
    embedModule,
    warningModule,
    listModule,
    imageModule,
    tableModule,
  ] = await Promise.all([
    import("@editorjs/editorjs"),
    import("@editorjs/header"),
    import("@editorjs/embed"),
    import("@editorjs/warning"),
    import("@editorjs/list"),
    import("@editorjs/image"),
    import("@editorjs/table"),
  ]);

  return {
    EditorJS: editorModule.default,
    Header: headerModule.default,
    Embed: embedModule.default,
    Warning: warningModule.default,
    List: listModule.default,
    ImageTool: imageModule.default,
    Table: tableModule.default,
  };
}
