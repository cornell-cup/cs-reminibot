def get_unseen(lst1, lst2): 
    unseen = [] 
    for i in range(len(lst1)+1):
        sublist = lst1[len(lst1)-i:] 
        if lst2[:len(sublist)] == sublist:
            unseen = lst2[i:]
    return unseen 

print(get_unseen([1,2,3], [4,5,6]))
print(get_unseen([1,2,3], [1,5,6]))
print(get_unseen([1,2,3], [3,5,6]))
print(get_unseen([1,2,3], [2,3,6]))
print(get_unseen([1,2,3], [1,2,3]))
