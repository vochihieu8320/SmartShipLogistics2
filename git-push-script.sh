#!/bin/bash

# Script để đẩy code lên GitHub
# Sử dụng: ./git-push-script.sh "Mô tả commit của bạn"

# Kiểm tra xem đã cung cấp thông điệp commit chưa
if [ -z "$1" ]; then
  echo "Vui lòng cung cấp thông điệp commit"
  echo "Ví dụ: ./git-push-script.sh \"Cập nhật API proxy và định dạng tiền tệ\""
  exit 1
fi

# Thay thế USERNAME bằng tên người dùng GitHub của bạn
GIT_USERNAME="vochihieu8320"
REPOSITORY_URL="https://github.com/vochihieu8320/SmartShipLogistics2.git"
COMMIT_MESSAGE="$1"

# Khởi tạo repository nếu chưa có
if [ ! -d ".git" ]; then
  echo "Khởi tạo Git repository..."
  git init
fi

# Cấu hình thông tin người dùng
echo "Cấu hình thông tin người dùng Git..."
git config --global user.name "$GIT_USERNAME"
git config --global user.email "$GIT_USERNAME@users.noreply.github.com"

# Thêm remote repository nếu chưa có
if ! git remote | grep -q "origin"; then
  echo "Thêm remote repository..."
  git remote add origin $REPOSITORY_URL
else
  echo "Cập nhật remote repository..."
  git remote set-url origin $REPOSITORY_URL
fi

# Thêm tất cả các file đã thay đổi
echo "Thêm các file đã thay đổi..."
git add .

# Commit các thay đổi với thông điệp
echo "Commit các thay đổi với thông điệp: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

# Đẩy code lên GitHub
echo "Đẩy code lên GitHub..."
# Sử dụng GitHub Personal Access Token từ biến môi trường
if [ -n "$GITHUB_TOKEN" ]; then
  # Sử dụng token trong URL
  REPOSITORY_URL_WITH_TOKEN="https://$GIT_USERNAME:$GITHUB_TOKEN@github.com/vochihieu8320/SmartShipLogistics2.git"
  git push -u $REPOSITORY_URL_WITH_TOKEN main
else
  echo "Không tìm thấy GITHUB_TOKEN trong biến môi trường."
  echo "Bạn có thể cần phải nhập mật khẩu GitHub của mình khi được yêu cầu."
  git push -u origin main
fi

echo "Hoàn tất!"