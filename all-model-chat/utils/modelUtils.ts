/**
 * 将模型 ID 转换为用户友好的显示名称
 * 例如: "gemini-3-pro-preview" -> "Gemini 3 Pro Preview"
 */
export function formatModelName(modelId: string): string {
    // 移除 "models/" 前缀
    let name = modelId.replace(/^models\//, '');

    // 将连字符和下划线替换为空格
    name = name.replace(/[-_]/g, ' ');

    // 首字母大写
    name = name.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return name;
}
