import os
import subprocess
import shutil
import json
import argparse
import time

def run_command(command, verbose=False, timeout=300, check=True):
    if verbose:
        print(f"执行命令: {command}")
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    try:
        output, error = process.communicate(timeout=timeout)
        if check and process.returncode != 0:
            print(f"错误: {error.decode('utf-8')}")
            exit(1)
        if verbose:
            print(f"命令输出:\n{output.decode('utf-8')}")
        return output.decode('utf-8'), process.returncode
    except subprocess.TimeoutExpired:
        process.kill()
        print(f"错误: 命令执行超时 ({timeout}秒)")
        exit(1)

def check_pnpm_version(verbose=False):
    try:
        version, _ = run_command('pnpm --version', verbose)
        print(f"pnpm 版本: {version.strip()}")
    except:
        print("错误: 未找到 pnpm。请确保已安装 pnpm。")
        exit(1)

def check_vsce_installation(verbose=False):
    try:
        output, returncode = run_command('vsce --version', verbose, check=False)
        if returncode == 0:
            print(f"vsce 版本: {output.strip()}")
            return True
    except:
        pass
    return False

def publish_extension(verbose=False):
    print("正在发布插件...")
    run_command('vsce publish', verbose)
    print("插件发布成功!")

def check_package_json(verbose=False):
    with open('package.json', 'r', encoding='utf-8') as f:
        package_data = json.load(f)
    
    required_fields = ['name', 'displayName', 'description', 'version', 'publisher']
    for field in required_fields:
        if field not in package_data:
            print(f"错误: package.json 中缺少 '{field}' 字段")
            exit(1)
    
    if verbose:
        print("package.json 检查通过")

def main(verbose=False, publish=False):
    # 检查 pnpm 版本
    check_pnpm_version(verbose)

    # 1. 确保我们在插件目录中
    if not os.path.exists('package.json'):
        print("错误: 未找到package.json文件。请确保您在插件目录中运行此脚本。")
        exit(1)

    # 2. 读取package.json以获取插件名称和版本
    with open('package.json', 'r', encoding='utf-8') as f:
        package_data = json.load(f)
    
    plugin_name = package_data['name']
    plugin_version = package_data['version']

    # 在安装依赖之前添加这一行
    check_package_json(verbose)

    # 3. 安装依赖
    print("正在安装依赖...")
    run_command('pnpm install', verbose, timeout=600)

    # 4. 编译TypeScript
    print("正在编译TypeScript...")
    run_command('pnpm run compile', verbose)

    # 5. 检查vsce是否已安装，如果没有则安装
    print("正在检查vsce...")
    if not check_vsce_installation(verbose):
        print("vsce未安装，正在安装...")
        run_command('pnpm add -g @vscode/vsce', verbose)
    else:
        print("vsce已安装")

    # 6. 打包插件
    print("正在打包插件...")
    run_command('vsce package --baseContentUrl https://your-content-url --baseImagesUrl https://your-images-url', verbose)

    # 7. 移动.vsix文件到一个新目录
    vsix_file = f"{plugin_name}-{plugin_version}.vsix"
    if not os.path.exists('dist'):
        os.mkdir('dist')
    shutil.move(vsix_file, os.path.join('dist', vsix_file))

    print(f"插件打包成功! .vsix文件已保存在 dist/{vsix_file}")

    # 8. 如果指定了发布选项，则发布插件
    if publish:
        publish_extension(verbose)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="构建VS Code插件的VSIX包")
    parser.add_argument('-v', '--verbose', action='store_true', help="显示详细输出")
    parser.add_argument('-p', '--publish', action='store_true', help="发布插件到 Marketplace")
    args = parser.parse_args()

    main(verbose=args.verbose, publish=args.publish)
