import tseslint from 'typescript-eslint';

const visualProperties = '^(background|backgroundColor|color|.*Color|fontSize|fontFamily|fontWeight|lineHeight|letterSpacing|width|height|minWidth|maxWidth|minHeight|maxHeight|margin.*|padding.*|gap|rowGap|columnGap|border.*Width|border.*Radius|top|right|bottom|left|inset.*|boxShadow|shadowRadius|shadowOpacity|elevation|transitionDuration|animationDuration)$';
const visualProps = '^(color|size|width|height|fontSize)$';
const tokenMessage = 'Use a design token from @odyssey/shared; literal colors and visual sizes belong in packages/shared.';
const literalVisualValue = ':matches(Literal, UnaryExpression[argument.type="Literal"], TemplateLiteral[expressions.length=0])';
// Component props may name tokens; raw style objects must use token values.
const namedVisualToken = '^(sm|md|lg|background|surface|surfaceRaised|border|textPrimary|textSecondary|textMuted|transparent|primary|primaryHover|primarySubtle|primaryText|success|successSubtle|successText|warning|warningSubtle|warningText|danger|dangerSubtle|dangerText|info|infoSubtle|infoText)$';

export default tseslint.config(
  { ignores: ['**/node_modules/**', '**/.turbo/**', '**/dist/**', '**/generated/**', '**/generated-validation/**', '**/.expo/**', '**/expo-env.d.ts'] },
  ...tseslint.configs.recommended,
  {
    files: ['apps/**/*.{ts,tsx,js,jsx}', 'packages/**/*.{ts,tsx,js,jsx}'],
    ignores: ['packages/shared/**', '**/*.test.*', '**/tests/**'],
    rules: {
      'no-restricted-syntax': ['error',
        { selector: `Property[key.name=/${visualProperties}/] > ${literalVisualValue}.value`, message: tokenMessage },
        { selector: `Property[key.value=/${visualProperties}/] > ${literalVisualValue}.value`, message: tokenMessage },
        { selector: `JSXAttribute[name.name=/${visualProps}/] > Literal.value:not([value=/${namedVisualToken}/])`, message: tokenMessage },
        { selector: `JSXAttribute[name.name=/${visualProps}/] > JSXExpressionContainer > ${literalVisualValue}:not([value=/${namedVisualToken}/])`, message: tokenMessage },
        { selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]', message: tokenMessage },
      ],
    },
  },
);
