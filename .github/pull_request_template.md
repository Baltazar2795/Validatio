# из корня репозитория
mkdir -p .github
printf "%s\n" "# Заголовок PR
Коротко: что и зачем.

## Что изменилось
- [ ] ...

## Как проверить
1. ...
2. ...

## Чек-лист
- [ ] CI зелёный (build, typecheck, lint)
- [ ] Нет секретов/ключей в коде
- [ ] Обновил документацию/README (если нужно)
- [ ] Изменения согласованы с CODEOWNERS

## Скриншоты/видео
(если есть)

## Связанные задачи
Closes #123
" > .github/pull_request_template.md

git checkout -b codex/add-pr-template
git add .github/pull_request_template.md
git commit -m "chore: add PR template"
git push -u origin codex/add-pr-template
