
Add-Type -AssemblyName System.Windows.Forms
cd "D:\Python\失智"  # ← 請依實際專案路徑修改
$changes = git status --porcelain
if ($changes) {
    [System.Windows.Forms.MessageBox]::Show("⚠️ 有尚未提交的變更，請記得 git commit & push！", "Git 提醒")
}
