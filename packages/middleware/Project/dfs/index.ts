
/**
 * 
 * @description 指定层级禁用
 */

export const disabledByLevel:any = (options: string | any[], level: number, targetLevel: number) => {
    for (let i = 0; i < options.length; i++) {
        if (options[i].children) {
            if(level >= targetLevel){
                options[i].disabled = true;
            }
            options[i].children = disabledByLevel(options[i].children, level + 1,targetLevel) ?? [];
        }
        else if(level >= targetLevel){
            options[i].disabled = true;
        }
    }
    return options;
};